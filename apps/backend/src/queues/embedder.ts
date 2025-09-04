import { Queue, Worker } from 'bullmq'
import { connection } from '.'
import { embedder } from '../globals'
import { EmbedInput, EmbedOutput } from '@trowel/types'

const NAME = 'embedder'

const queue = new Queue(NAME, { connection })

const worker = new Worker<EmbedInput, EmbedOutput>(
  NAME,
  async (job) => embedder.process(job.data),
  {
    connection,
    concurrency: 1,
  }
)

worker.on('completed', (_, data) => {
  console.log('Embeddings: ', data.embeddings.length)
})

export async function addEmbeddingJob(input: EmbedInput) {
  const job = await queue.add(NAME, input, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })

  return job
}
