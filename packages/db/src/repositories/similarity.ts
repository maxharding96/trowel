import prisma from '../client'

export const similarityRepositry = {
  create: (data: {
    listingVideoId: string
    wantVideoId: string
    score: number
    searchId: string
  }) =>
    prisma.similarity.create({
      data,
    }),
}
