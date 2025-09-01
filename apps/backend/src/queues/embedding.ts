import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { z } from 'zod'
import IORedis from 'ioredis'
import { server } from '../globals'

const connection = new IORedis({ maxRetriesPerRequest: null })

const ProcessJob = z.object({
  urls: z.array(z.string()),
})

type ProcessJob = z.infer<typeof ProcessJob>

const queue = new Queue<ProcessJob>('embedding', { connection })

const queueEvents = new QueueEvents('embedding', { connection })

const worker = new Worker('embedding', processJob, {
  connection,
  limiter: {
    max: 60, // 60 requests
    duration: 60000, // per minute
  },
})

async function processJob(job: Job<ProcessJob>) {
  return server.embed({ urls: job.data.urls })
}

export async function addJob<T>(data: ProcessJob) {
  const job = await queue.add('embedding', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })

  return job
}

export async function awaitJob(data: ProcessJob) {
  const job = await addJob(data)

  const response = await job.waitUntilFinished(queueEvents)
  return response
}
