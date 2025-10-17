import { Queue, Worker } from 'bullmq'
import { connection } from '.'
import { similarityRepositry, videoRepositry } from '@trowel/db'
import { z } from 'zod'
import { cosineSimilarity } from '../utils/common'

const jobSchema = z.object({
  searchId: z.string(),
  listingVideoId: z.string(),
  wantVideoId: z.string(),
})

type JobInput = z.infer<typeof jobSchema>

const queue = new Queue('similarity-queue', {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
})

const worker = new Worker<JobInput>(
  'similarity-queue',
  async (job) => {
    const { searchId, listingVideoId, wantVideoId } = job.data

    const listingEmbedding =
      await videoRepositry.getEmbeddingOrThrow(listingVideoId)
    const wantlistEmbedding =
      await videoRepositry.getEmbeddingOrThrow(wantVideoId)

    let score = -1

    if (listingEmbedding && wantlistEmbedding) {
      score = cosineSimilarity(listingEmbedding, wantlistEmbedding)
    }

    await similarityRepositry.create({
      searchId,
      listingVideoId,
      wantVideoId,
      score,
    })
  },
  { connection, concurrency: 32 }
)

worker.on('error', (err) => {
  // log the error
  console.error(err)
})

export async function addSimilarityJob(input: JobInput) {
  const job = await queue.add(`similarity-job-${input.searchId}`, input, {
    deduplication: { id: `${input.listingVideoId}::${input.wantVideoId}` },
  })

  return job
}

export async function addSimilarityBulk(inputs: JobInput[]) {
  const jobs = await queue.addBulk([
    ...inputs.map((input) => ({
      name: 'similarity-job',
      data: input,
      opts: {
        deduplication: { id: `${input.listingVideoId}::${input.wantVideoId}` },
      },
    })),
  ])

  return jobs
}
