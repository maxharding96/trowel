import type { Embedding } from '@trowel/types'
import prisma from '../client'

export const videoRepositry = {
  setEmbedProcessing(id: string) {
    return prisma.video.update({
      where: { id },
      data: {
        status: 'PROCESSING',
      },
    })
  },
  setEmbedSuccess({ id, embedding }: { id: string; embedding: Embedding }) {
    return prisma.video.update({
      where: { id },
      data: {
        embedding,
        status: 'SUCCESS',
      },
    })
  },
  setEmbedFailed(id: string) {
    return prisma.video.update({
      where: { id },
      data: {
        status: 'FAILED',
      },
    })
  },

  async getEmbeddingOrThrow(id: string) {
    const video = await prisma.video.findUniqueOrThrow({
      where: { id },
      select: {
        status: true,
        embedding: true,
      },
    })

    switch (video.status) {
      case 'PENDING':
      case 'PROCESSING': {
        throw new Error('Video not finished processing')
      }
      case 'FAILED':
        return null
      case 'SUCCESS':
        if (!video.embedding) {
          throw new Error('Video embedding is missing')
        }

        return video.embedding as Embedding
    }
  },

  getManyWithEmbeddings(ids: string[]) {
    return prisma.video.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        embedding: true,
      },
    })
  },
}
