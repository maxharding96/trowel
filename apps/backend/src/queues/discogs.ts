import { connection } from '.'
import { Queue, Worker } from 'bullmq'
import { discogs } from '../globals'
import {
  GetListingsInputSchema,
  GetReleaseInputSchema,
  ReleaseSchema,
  GetWantlistOutputSchema,
  GetListingsOutputSchema,
  GetWantlistInputSchema,
} from '@trowel/types'
import type {
  GetListingsInput,
  GetWantlistInput,
  GetReleaseInput,
} from '@trowel/types'
import { z } from 'zod'
import { addEmbeddingJob } from './embedder'

const JobInput = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('get-release'),
    input: GetReleaseInputSchema,
  }),
  z.object({
    type: z.literal('get-listings'),
    input: GetListingsInputSchema,
  }),
  z.object({
    type: z.literal('get-wantlist'),
    input: GetWantlistInputSchema,
  }),
])

type JobInput = z.infer<typeof JobInput>

const JobOutput = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('get-release'),
    output: ReleaseSchema,
  }),
  z.object({
    type: z.literal('get-listings'),
    output: GetListingsOutputSchema,
  }),
  z.object({
    type: z.literal('get-wantlist'),
    output: GetWantlistOutputSchema,
  }),
])

type JobOutput = z.infer<typeof JobOutput>

const NAME = 'discogs'

const queue = new Queue(NAME, { connection })

const worker = new Worker<JobInput, JobOutput>(
  NAME,
  async (job) => {
    switch (job.data.type) {
      case 'get-release': {
        const output = await discogs.getRelease(job.data.input)
        return { type: 'get-release', output }
      }
      case 'get-listings': {
        const output = await discogs.getListings(job.data.input)
        return { type: 'get-listings', output }
      }
      case 'get-wantlist': {
        const output = await discogs.getWantlist(job.data.input)
        return { type: 'get-wantlist', output }
      }
      default:
        throw new Error(`Unknown job name: ${job.name}`)
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

worker.on('completed', async (_, data) => {
  console.log('Job completed with data:', data.type)

  switch (data.type) {
    case 'get-release': {
      const urls = data.output.videos.map((video) => video.uri)

      console.log('Got release with urls:', urls.length)

      //TODO create releases

      void addEmbeddingJob({ urls })

      break
    }
    case 'get-listings': {
      const { listings } = data.output

      for (const listing of listings.slice(0, 1)) {
        void addGetReleaseJob({ release_id: listing.release.id })
      }

      break
    }

    case 'get-wantlist': {
      const { wants } = data.output

      for (const want of wants.slice(0, 1)) {
        void addGetReleaseJob({ release_id: want.id })
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

export function addGetReleaseJob(input: GetReleaseInput) {
  return addJob({
    type: 'get-release',
    input,
  })
}

export function addGetWantlistJob(input: GetWantlistInput) {
  return addJob({
    type: 'get-wantlist',
    input,
  })
}

export function addGetListingsJob(input: GetListingsInput) {
  return addJob({
    type: 'get-listings',
    input,
  })
}
