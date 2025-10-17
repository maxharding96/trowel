import prisma from '../client'
import type { Release, Want } from '@trowel/types'

export const wantRepositry = {
  async upsertMany({ searchId, wants }: { searchId: string; wants: Want[] }) {
    const wantsDB = []

    for (const want of wants) {
      const wantDB = await prisma.want.upsert({
        where: { externalId: want.id },
        create: {
          externalId: want.id,
          resourceUrl: want.resource_url,
          search: { connect: { id: searchId } },
        },
        update: {
          search: { connect: { id: searchId } },
        },
        select: { id: true },
      })

      wantsDB.push(wantDB)
    }

    return wantsDB
  },

  async addRelease({ id, release }: { id: string; release: Release }) {
    const want = await prisma.want.update({
      where: { id },
      data: {
        release: {
          connectOrCreate: {
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
          },
        },
      },
      include: {
        release: {
          include: { videos: true },
        },
      },
    })

    if (!want.release) {
      throw new Error('Failed to add release to want')
    }

    return want.release
  },

  connectRelease({ id, releaseId }: { id: string; releaseId: string }) {
    return prisma.want.update({
      where: { id },
      data: {
        release: {
          connect: { id: releaseId },
        },
      },
    })
  },
}
