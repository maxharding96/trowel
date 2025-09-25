import { Queue, Worker } from 'bullmq'
import { connection } from '.'
import { embedder } from '../globals'
import { videoRepositry } from '@trowel/db'
import type { EmbedInput } from '@trowel/types'
import { z } from 'zod'

const queue = new Queue('embedder-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
})

const worker = new Worker<EmbedInput>(
  'embedder-queue',
  async (job) => {
    const { id, uri } = job.data

    try {
      await videoRepositry.setEmbedProcessing(id)

      const response = await embedder.process({ id, uri })

      await videoRepositry.setEmbedSuccess(response)
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

export async function addEmbeddingJob(input: EmbedInput) {
  const job = await queue.add(`embedder-job-${input.id}`, input, {
    deduplication: { id: input.id },
  })

  return job
}
