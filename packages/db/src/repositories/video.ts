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
  getManyWithEmbeddings(ids: string[]) {
    return prisma.listing.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        release: {
          select: {
            videos: {
              select: { embedding: true },
            },
          },
        },
      },
    })
  },
}
