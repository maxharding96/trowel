import { Queue, Worker } from 'bullmq'
import { connection } from '.'
import { z } from 'zod'
import { addGetListingsJob, addGetWantlistJob } from './discogs'
import { searchRepositry } from '@trowel/db'

const jobSchema = z.object({
  searchId: z.string(),
  listings: z.string(),
  wantlist: z.string(),
})

type JobInput = z.infer<typeof jobSchema>

const queue = new Queue('search-queue', {
  connection,
  defaultJobOptions: { removeOnComplete: true, removeOnFail: true },
})

const worker = new Worker<JobInput>(
  'search-queue',
  async (job) => {
    const { searchId, listings, wantlist } = job.data

    try {
      await searchRepositry.setProcessing(searchId)

      await addGetListingsJob({ searchId, username: listings })
      await addGetWantlistJob({ searchId, username: wantlist })

      await searchRepositry.setSucceeded(searchId)
    } catch (error) {
      await searchRepositry.setFailed(searchId)
      throw error
    }
  },
  { connection }
)

worker.on('error', (err) => {
  // log the error
  console.error(err)
})

export async function addSearchJob(input: JobInput) {
  const job = await queue.add(`search-job-${input.searchId}`, input, {
    deduplication: { id: input.searchId },
  })

  return job
}
