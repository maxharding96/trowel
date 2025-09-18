import type { Release } from '@trowel/types'
import prisma from '../client'
import type { Embedding } from '@trowel/types'

export const releaseRepositry = {
  getReleaseForExternalId(externalId: number) {
    return prisma.release.findUnique({
      where: { externalId },
      include: { videos: true },
    })
  },

  upsert(release: Release) {
    return prisma.release.upsert({
      where: { externalId: release.id },
      create: {
        externalId: release.id,
        title: release.title,
        artists: {
          connectOrCreate: release.artists.map((artist) => ({
            where: { externalId: artist.id },
            create: {
              externalId: artist.id,
              name: artist.name,
              resourceUrl: artist.resource_url,
            },
          })),
        },
        thumb: release.thumb,
        country: release.country,
        genres: release.genres,
        lowestPrice: release.lowest_price,
        numForSale: release.num_for_sale,
        resourceUrl: release.resource_url,
        status: release.status,
        styles: release.styles,
        uri: release.uri,
        videos: {
          create: release.videos,
        },
        year: release.year,
      },
      update: {
        lowestPrice: release.lowest_price,
        numForSale: release.num_for_sale,
      },
    })
  },

  setEmbedSuccess({
    id,
    updates,
  }: {
    id: string
    updates: {
      id: string
      embedding: Embedding
    }[]
  }) {
    return prisma.release.update({
      where: { id },
      data: {
        videos: {
          updateMany: updates.map(({ id, embedding }) => ({
            where: { id },
            data: { embedding },
          })),
        },
        embeddingStatus: 'success',
      },
    })
  },

  setEmbedFailed(id: string) {
    return prisma.release.update({
      where: { id },
      data: {
        embeddingStatus: 'failed',
      },
    })
  },
}
