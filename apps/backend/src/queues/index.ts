import { Queue, Worker, Job } from 'bullmq'
import { z } from 'zod'
import { discogs, server } from '../globals'
import IORedis from 'ioredis'

const connection = new IORedis({ maxRetriesPerRequest: null })

const ProcessJob = z.object({
  collection: z.string(),
  listings: z.string(),
})

type ProcessJob = z.infer<typeof ProcessJob>

const queue = new Queue<ProcessJob, void>('process', { connection })

async function processJob(job: Job<ProcessJob>) {
  console.log(`Processing job ${job.id} with data:`, job.data)

  const { collection, listings } = job.data

  console.log(collection, listings)

  const listingList = await discogs.getListings({
    username: listings,
  })

  console.log('Fetched listings:', listingList.listings.length)

  const wantlistList = await discogs.getWantlist({
    username: collection,
  })

  const urls = new Set<string>()

  for (const listing of listingList.listings) {
    const release = await discogs.getRelease({ release_id: listing.release.id })

    console.log('Fetched listing:', release.title)

    for (const video of release.videos) {
      urls.add(video.uri)
    }
  }

  // for (const want of wantlistList.wants) {
  //   const release = await discogs.getRelease({ release_id: want.id })

  //   console.log('Fetched want:', release.title)

  //   for (const video of release.videos) {
  //     urls.add(video.uri)
  //   }
  // }

  console.log('Total URLs to embed:', urls.size)

  const exampleUrls = Array.from(urls).slice(0, 3)

  const response = await server.embed({ urls: exampleUrls })

  console.log('Embeds created:', response.embeddings.length)
}

const worker = new Worker<ProcessJob, void>('process', processJob, {
  connection,
})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with error: ${err.message}`)
})

export async function addProcessJob(data: ProcessJob) {
  const job = await queue.add('process', data)

  console.log(`Added job ${job.id} to the queue`)

  return job
}
