import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { z } from 'zod'
import IORedis from 'ioredis'

const connection = new IORedis({ maxRetriesPerRequest: null })

const ProcessJob = z.object({
  path: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
})

type ProcessJob = z.infer<typeof ProcessJob>

type Output = Record<string, any>

const queue = new Queue<ProcessJob, Output>('discogs', { connection })

const queueEvents = new QueueEvents('discogs', { connection })

const worker = new Worker('discogs', processJob, {
  connection,
  limiter: {
    max: 60, // 60 requests
    duration: 60000, // per minute
  },
})

async function processJob(job: Job<ProcessJob>): Promise<Output> {
  const { path } = job.data

  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`)
  }

  return response.json()
}

export async function addJob<T>(data: ProcessJob) {
  const job = await queue.add('discogs', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })

  return job
}

export async function awaitJob(data: ProcessJob): Promise<Output> {
  const job = await addJob(data)

  const response = await job.waitUntilFinished(queueEvents)
  return response
}
