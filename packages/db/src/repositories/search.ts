import prisma from '../client'

export const searchRepositry = {
  create: () =>
    prisma.search.create({
      data: {},
    }),

  getListings: (searchId: string) =>
    prisma.listing.findMany({
      where: { searchId },
      include: {
        release: {
          select: {
            videos: {
              select: {
                embedding: true,
              },
            },
          },
        },
      },
    }),

  getWantlist: (searchId: string) =>
    prisma.want.findMany({
      where: { searchId },
      include: {
        release: {
          select: {
            videos: {
              select: {
                embedding: true,
              },
            },
          },
        },
      },
    }),
}
