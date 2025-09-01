import prisma from '../client'

export const searchRepositry = {
  create: ({ id }: { id: string }) => {
    return prisma.search.create({
      data: {
        id,
      },
    })
  },
}
