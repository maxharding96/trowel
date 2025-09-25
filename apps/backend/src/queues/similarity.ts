import { Queue, Worker } from 'bullmq'
import { connection } from '.'
import {
  listingRepositry,
  searchRepositry,
  similarityRepositry,
  wantRepositry,
} from '@trowel/db'
import type { Embedding } from '@trowel/types'
import { z } from 'zod'
import { cosineSimilarity } from '../utils/common'

const jobSchema = z.object({
  searchId: z.string(),
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
    const { searchId } = job.data

    const missingSimilarities =
      await searchRepositry.getMissingSimilarities(searchId)

    const listingIds = new Set<string>()
    const wantIds = new Set<string>()

    for (const pair of missingSimilarities) {
      listingIds.add(pair.listingId)
      wantIds.add(pair.wantId)
    }

    const listingsWithEmbeddings = await listingRepositry.getManyWithEmbeddings(
      Array.from(listingIds)
    )

    console.log(1, listingsWithEmbeddings.length)

    const wantsWithEmbeddings = await wantRepositry.getManyWithEmbeddings(
      Array.from(wantIds)
    )

    console.log(2, wantsWithEmbeddings.length)

    const wantIdToEmbedMap = new Map<string, Embedding[]>()
    const listingIdToEmbedMap = new Map<string, Embedding[]>()

    for (const want of wantsWithEmbeddings) {
      if (!want.release) continue

      const embeddings = want.release.videos.map((video) => video.embedding)

      wantIdToEmbedMap.set(want.id, embeddings)
    }

    for (const listing of listingsWithEmbeddings) {
      if (!listing.release) continue

      const embeddings = listing.release.videos.map((video) => video.embedding)

      listingIdToEmbedMap.set(listing.id, embeddings)
    }

    const similaritiesToCreate = []

    for (const pair of missingSimilarities) {
      const listingEmbeds = listingIdToEmbedMap.get(pair.listingId)
      const wantEmbeds = wantIdToEmbedMap.get(pair.wantId)

      if (
        !listingEmbeds ||
        listingEmbeds.length === 0 ||
        !wantEmbeds ||
        wantEmbeds.length === 0
      ) {
        console.log(3)

        // If either listing or want lacks embeddings, we skip similarity calculation.
        similaritiesToCreate.push({
          listingId: pair.listingId,
          wantId: pair.wantId,
          score: -1,
          searchId,
        })

        continue
      }

      let maxSimilarity = -1

      for (const listingEmbed of listingEmbeds) {
        for (const wantEmbed of wantEmbeds) {
          const similarity = cosineSimilarity(listingEmbed, wantEmbed)
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity
          }
        }
      }

      similaritiesToCreate.push({
        listingId: pair.listingId,
        wantId: pair.wantId,
        score: maxSimilarity,
        searchId,
      })
    }

    if (similaritiesToCreate.length > 0) {
      const chunkSize = 100
      for (let i = 0; i < similaritiesToCreate.length; i += chunkSize) {
        const chunk = similaritiesToCreate.slice(i, i + chunkSize)

        await similarityRepositry.createMany(chunk)
      }
    }
  },
  { connection }
)

worker.on('error', (err) => {
  // log the error
  console.error(err)
})

export async function addSimilarityJob(input: JobInput) {
  const job = await queue.add(`similarity-job-${input.searchId}`, input, {
    deduplication: { id: input.searchId },
  })

  return job
}
