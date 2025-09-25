import prisma from '../client'

export const similarityRepositry = {
  createMany: (
    data: {
      listingId: string
      wantId: string
      score: number
      searchId: string
    }[]
  ) =>
    prisma.similarity.createMany({
      data,
      skipDuplicates: true,
    }),
}
