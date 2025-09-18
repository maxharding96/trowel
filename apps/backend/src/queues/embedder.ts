import { Queue, Worker } from 'bullmq'
import { connection } from '.'
import { embedder } from '../globals'
import { VideoInput, VideoOutput } from '@trowel/types'
import { z } from 'zod'
import { releaseRepositry } from '@trowel/db'

const JobInputSchema = z.object({
  releaseId: z.string(),
  videos: VideoInput.array(),
})

type JobInput = z.infer<typeof JobInputSchema>

const JobOutputSchema = z.object({
  videos: VideoOutput.array(),
})

type JobOutput = z.infer<typeof JobOutputSchema>

const NAME = 'embedder'

const queue = new Queue(NAME, { connection })

const worker = new Worker<JobInput, JobOutput>(
  NAME,
  async (job) => embedder.process(job.data),
  {
    connection,
    concurrency: 4,
  }
)

worker.on('completed', (job, response) =>
  releaseRepositry.setEmbedSuccess({
    id: job.data.releaseId,
    updates: response.videos,
  })
)

worker.on('failed', (job) => {
  if (job) {
    releaseRepositry.setEmbedFailed(job.data.releaseId)
  }
})

export async function addEmbeddingJob(input: JobInput) {
  const job = await queue.add(NAME, input, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })

  return job
}
