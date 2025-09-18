import { connection } from '.'
import { Queue, Worker } from 'bullmq'
import { discogs } from '../globals'
import { ReleaseSchema, ListingSchema, WantSchema } from '@trowel/types'
import { z } from 'zod'
import { addEmbeddingJob } from './embedder'
import { releaseRepositry, listingRepositry, wantRepositry } from '@trowel/db'
import { zip } from '../utils/common'

const JobInput = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('get-listing-release'),
    releaseId: z.number(),
    listingId: z.string(),
  }),
  z.object({
    type: z.literal('get-wantlist-release'),
    releaseId: z.number(),
    wantId: z.string(),
  }),
  z.object({
    type: z.literal('get-listings'),
    searchId: z.string(),
    username: z.string(),
  }),
  z.object({
    type: z.literal('get-wantlist'),
    searchId: z.string(),
    username: z.string(),
  }),
])

type JobInput = z.infer<typeof JobInput>

const JobOutput = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('get-listing-release'),
    release: ReleaseSchema,
    listingId: z.string(),
  }),
  z.object({
    type: z.literal('get-wantlist-release'),
    release: ReleaseSchema,
    wantId: z.string(),
  }),
  z.object({
    type: z.literal('get-listings'),
    searchId: z.string(),
    listings: ListingSchema.array(),
  }),
  z.object({
    type: z.literal('get-wantlist'),
    searchId: z.string(),
    wants: WantSchema.array(),
  }),
])

type JobOutput = z.infer<typeof JobOutput>

const NAME = 'discogs'

const queue = new Queue(NAME, { connection })

const worker = new Worker<JobInput, JobOutput>(
  NAME,
  async ({ data }) => {
    switch (data.type) {
      case 'get-listing-release': {
        const { listingId, releaseId } = data

        const release = await discogs.getRelease({
          releaseId,
        })
        return { type: 'get-listing-release', listingId, release }
      }
      case 'get-wantlist-release': {
        const { wantId, releaseId } = data

        const release = await discogs.getRelease({
          releaseId,
        })
        return { type: 'get-wantlist-release', wantId, release }
      }
      case 'get-listings': {
        const { searchId, username } = data

        const { listings } = await discogs.getListings({
          username,
        })
        return { type: 'get-listings', searchId, listings }
      }
      case 'get-wantlist': {
        const { searchId, username } = data

        const { wants } = await discogs.getWantlist({
          username,
        })
        return { type: 'get-wantlist', searchId, wants }
      }
      default:
        throw new Error(`Unknown job data type: ${data}`)
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

worker.on('completed', async (_, output) => {
  switch (output.type) {
    case 'get-listing-release': {
      const { listingId, release } = output

      const releaseDB = await listingRepositry.addRelease({
        id: listingId,
        release,
      })

      await addEmbeddingJob({
        releaseId: releaseDB.id,
        videos: releaseDB.videos,
      })

      break
    }
    case 'get-wantlist-release': {
      const { wantId, release } = output

      const releaseDB = await wantRepositry.addRelease({ id: wantId, release })

      await addEmbeddingJob({
        releaseId: releaseDB.id,
        videos: releaseDB.videos,
      })

      break
    }
    case 'get-listings': {
      const { searchId, listings } = output

      const listingsDB = await listingRepositry.createMany({
        searchId,
        listings,
      })

      for (const [listing, listingDB] of zip(listings, listingsDB)) {
        const releaseId = listing.release.id

        const release =
          await releaseRepositry.getReleaseForExternalId(releaseId)

        if (!release) {
          await addGetListingReleaseJob(listingDB.id, releaseId)
        } else {
          await listingRepositry.connectRelease({
            id: listingDB.id,
            releaseId: release.id,
          })

          if (release.embeddingStatus === 'failed') {
            await addEmbeddingJob({
              releaseId: release.id,
              videos: release.videos,
            })
          }
        }
      }
      break
    }

    case 'get-wantlist': {
      const { searchId, wants } = output

      const wantsDB = await wantRepositry.createMany({
        searchId,
        wants,
      })

      for (const [want, wantDB] of zip(wants, wantsDB)) {
        const releaseId = want.basic_information.id

        const release =
          await releaseRepositry.getReleaseForExternalId(releaseId)

        if (!release) {
          await addGetWantReleaseJob(wantDB.id, releaseId)
        } else {
          await wantRepositry.connectRelease({
            id: wantDB.id,
            releaseId: release.id,
          })

          if (release.embeddingStatus === 'failed') {
            await addEmbeddingJob({
              releaseId: release.id,
              videos: release.videos,
            })
          }
        }
      }
      break
    }
  }
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.data.type} has failed with error: ${err.message}`)
})

async function addJob(input: JobInput) {
  const job = await queue.add('api-request', input, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })

  return job
}

export function addGetListingReleaseJob(listingId: string, releaseId: number) {
  return addJob({
    type: 'get-listing-release',
    listingId,
    releaseId,
  })
}

export function addGetWantReleaseJob(wantId: string, releaseId: number) {
  return addJob({
    type: 'get-wantlist-release',
    wantId,
    releaseId,
  })
}

export function addGetWantlistJob(searchId: string, username: string) {
  return addJob({
    type: 'get-wantlist',
    searchId,
    username,
  })
}

export function addGetListingsJob(searchId: string, username: string) {
  return addJob({
    type: 'get-listings',
    searchId,
    username,
  })
}
