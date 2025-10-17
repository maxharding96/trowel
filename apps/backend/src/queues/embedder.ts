import { Queue, Worker } from 'bullmq'
import { connection } from '.'
import { embedder } from '../globals'
import { searchRepositry, videoRepositry } from '@trowel/db'
import { z } from 'zod'
import { addSimilarityBulk } from './similarity'

const jobSchema = z.object({
  searchId: z.string(),
  id: z.string(),
  uri: z.string(),
  type: z.enum(['listing', 'want']),
})

type JobInput = z.infer<typeof jobSchema>

const queue = new Queue('embedder-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    // attempts: 3,
    // backoff: { type: 'exponential', delay: 2000 },
  },
})

const worker = new Worker<JobInput>(
  'embedder-queue',
  async (job) => {
    const { searchId, id, uri, type } = job.data

    try {
      await videoRepositry.setEmbedProcessing(id)

      const response = await embedder.process({ id, uri })

      await videoRepositry.setEmbedSuccess(response)

      switch (type) {
        case 'listing': {
          const videos =
            await searchRepositry.getAllEmbeddedVideosInWantlist(searchId)

          const jobs = videos.map((video) => ({
            searchId,
            listingVideoId: id,
            wantVideoId: video.id,
          }))

          await addSimilarityBulk(jobs)

          break
        }
        case 'want': {
          const videos =
            await searchRepositry.getAllEmbeddedVideosInListings(searchId)

          const jobs = videos.map((video) => ({
            searchId,
            listingVideoId: video.id,
            wantVideoId: id,
          }))

          await addSimilarityBulk(jobs)

          break
        }
      }
    } catch (error) {
      await videoRepositry.setEmbedFailed(id)
    }
  },
  { connection }
)

worker.on('error', (err) => {
  // log the error
  console.error(err)
})

export async function addEmbeddingJob(input: JobInput) {
  const job = await queue.add(`embedder-job-${input.id}`, input, {
    deduplication: { id: input.id },
  })

  return job
}
