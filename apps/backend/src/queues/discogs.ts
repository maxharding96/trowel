import { connection } from '.'
import { Queue, Worker } from 'bullmq'
import { discogs } from '../globals'
import { z } from 'zod'
import { addEmbeddingJob } from './embedder'
import { releaseRepositry, listingRepositry, wantRepositry } from '@trowel/db'
import { zip } from '../utils/common'

const getListingReleaseJobSchema = z.object({
  type: z.literal('get-listing-release'),
  releaseId: z.number(),
  listingId: z.string(),
})

type GetListingReleaseJob = z.infer<typeof getListingReleaseJobSchema>

const getWantReleaseJobSchema = z.object({
  type: z.literal('get-wantlist-release'),
  releaseId: z.number(),
  wantId: z.string(),
})

type GetWantReleaseJob = z.infer<typeof getWantReleaseJobSchema>

const getListingsJobSchema = z.object({
  type: z.literal('get-listings'),
  searchId: z.string(),
  username: z.string(),
})

type GetListingsJob = z.infer<typeof getListingsJobSchema>

const getWantlistJobSchema = z.object({
  type: z.literal('get-wantlist'),
  searchId: z.string(),
  username: z.string(),
})

type GetWantlistJob = z.infer<typeof getWantlistJobSchema>

const jobSchema = z.discriminatedUnion('type', [
  getListingReleaseJobSchema,
  getWantReleaseJobSchema,
  getListingsJobSchema,
  getWantlistJobSchema,
])

type JobInput = z.infer<typeof jobSchema>

const queue = new Queue('discogs-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
})

const worker = new Worker<JobInput>(
  'discogs-queue',
  async ({ data }) => {
    switch (data.type) {
      case 'get-listing-release': {
        const { listingId, releaseId } = data

        const release = await discogs.getRelease({
          releaseId,
        })

        const releaseDB = await listingRepositry.addRelease({
          id: listingId,
          release,
        })

        for (const video of releaseDB.videos) {
          await addEmbeddingJob(video)
        }

        break
      }
      case 'get-wantlist-release': {
        const { wantId, releaseId } = data

        const release = await discogs.getRelease({
          releaseId,
        })

        const releaseDB = await wantRepositry.addRelease({
          id: wantId,
          release,
        })

        for (const video of releaseDB.videos) {
          await addEmbeddingJob(video)
        }

        break
      }
      case 'get-listings': {
        const { searchId, username } = data

        const { listings } = await discogs.getListings({
          username,
        })

        const listingsDB = await listingRepositry.upsertMany({
          searchId,
          listings,
        })

        for (const [listing, listingDB] of zip(listings, listingsDB)) {
          const releaseId = listing.release.id

          // Check if release already exists
          const releaseDB = await releaseRepositry.getForExternalId(releaseId)

          if (!releaseDB) {
            // If not, add job to fetch it
            await addGetListingReleaseJob({
              listingId: listingDB.id,
              releaseId,
            })
          } else {
            // If it does, just connect it
            await listingRepositry.connectRelease({
              id: listingDB.id,
              releaseId: releaseDB.id,
            })

            for (const video of releaseDB.videos) {
              // If embedding previously failed, try again
              if (video.status === 'FAILED') {
                await addEmbeddingJob(video)
              }
            }
          }
        }

        break
      }
      case 'get-wantlist': {
        const { searchId, username } = data

        const { wants } = await discogs.getWantlist({
          username,
        })
        const wantsDB = await wantRepositry.upsertMany({
          searchId,
          wants,
        })

        for (const [want, wantDB] of zip(wants, wantsDB)) {
          const releaseId = want.basic_information.id

          // Check if release already exists
          const releaseDB = await releaseRepositry.getForExternalId(releaseId)

          if (!releaseDB) {
            // If not, add job to fetch it
            await addGetWantReleaseJob({
              wantId: wantDB.id,
              releaseId,
            })
          } else {
            // If it does, just connect it
            await wantRepositry.connectRelease({
              id: wantDB.id,
              releaseId: releaseDB.id,
            })

            for (const video of releaseDB.videos) {
              // If embedding previously failed, try again
              if (video.status === 'FAILED') {
                await addEmbeddingJob(video)
              }
            }
          }
        }

        break
      }
    }
  },
  {
    connection,
    limiter: {
      max: 60, // 60 requests
      duration: 60000, // per minute
    },
  }
)

worker.on('error', (err) => {
  // log the error
  console.error(err)
})

async function addJob(input: JobInput) {
  const job = await queue.add('discogs-job', input)

  return job
}

export function addGetListingReleaseJob(
  input: Omit<GetListingReleaseJob, 'type'>
) {
  return addJob({
    type: 'get-listing-release',
    ...input,
  })
}

export function addGetWantReleaseJob(input: Omit<GetWantReleaseJob, 'type'>) {
  return addJob({
    type: 'get-wantlist-release',
    ...input,
  })
}

export function addGetWantlistJob(input: Omit<GetWantlistJob, 'type'>) {
  return addJob({
    type: 'get-wantlist',
    ...input,
  })
}

export function addGetListingsJob(input: Omit<GetListingsJob, 'type'>) {
  return addJob({
    type: 'get-listings',
    ...input,
  })
}
