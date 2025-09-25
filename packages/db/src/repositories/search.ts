import prisma from '../client'

export const searchRepositry = {
  create: () =>
    prisma.search.create({
      data: {},
    }),

  getCounts: (searchId: string) =>
    prisma.$transaction([
      prisma.want.count({
        where: {
          search: {
            some: { id: searchId },
          },
        },
      }),
      prisma.listing.count({
        where: {
          search: {
            some: { id: searchId },
          },
        },
      }),
      prisma.want.count({
        where: {
          search: {
            some: { id: searchId },
          },
          release: {
            videos: {
              every: {
                status: {
                  in: ['SUCCESS', 'FAILED'],
                },
              },
            },
          },
        },
      }),
      prisma.listing.count({
        where: {
          search: {
            some: { id: searchId },
          },
          release: {
            videos: {
              every: {
                status: {
                  in: ['SUCCESS', 'FAILED'],
                },
              },
            },
          },
        },
      }),
    ]),

  getEmbeddedWantlist: (searchId: string) =>
    prisma.want.findMany({
      where: {
        search: {
          some: { id: searchId },
        },
        release: {
          videos: {
            every: {
              status: {
                in: ['SUCCESS', 'FAILED'],
              },
            },
          },
        },
      },
      select: {},
    }),

  getEmbeddedListings: (searchId: string) =>
    prisma.listing.findMany({
      where: {
        search: {
          some: { id: searchId },
        },
        release: {
          videos: {
            every: {
              status: {
                in: ['SUCCESS', 'FAILED'],
              },
            },
          },
        },
      },
      select: {},
    }),

  setSucceeded: (searchId: string) =>
    prisma.search.update({
      where: { id: searchId },
      data: { status: 'SUCCESS' },
    }),

  setProcessing: (searchId: string) =>
    prisma.search.update({
      where: { id: searchId },
      data: { status: 'PROCESSING' },
    }),

  setFailed: (searchId: string) =>
    prisma.search.update({
      where: { id: searchId },
      data: { status: 'FAILED' },
    }),

  getBestSimilarities({
    searchId,
    minScore,
  }: {
    searchId: string
    minScore: number
  }) {
    return prisma.similarity.findMany({
      where: {
        searchId,
        score: { gte: minScore },
      },
      select: {
        score: true,
        listing: {
          select: {
            release: {
              select: {
                title: true,
                videos: {
                  select: {
                    uri: true,
                  },
                },
              },
            },
          },
        },
        want: {
          select: {
            release: {
              select: {
                title: true,
                videos: {
                  select: {
                    uri: true,
                  },
                },
              },
            },
          },
        },
      },
    })
  },
  async getMissingSimilarities(searchId: string) {
    const searchData = await prisma.search.findUnique({
      where: { id: searchId },
      select: {
        listings: { select: { id: true } },
        wantlist: { select: { id: true } },
      },
    })

    if (!searchData) {
      return []
    }

    // 2. Get all existing similarities for this search.
    const existingSimilarities = await prisma.similarity.findMany({
      where: {
        searchId,
        listing: {
          release: {
            videos: {
              every: {
                status: {
                  in: ['SUCCESS', 'FAILED'],
                },
              },
            },
          },
        },
        want: {
          release: {
            videos: {
              every: {
                status: {
                  in: ['SUCCESS', 'FAILED'],
                },
              },
            },
          },
        },
      },
      select: {
        listingId: true,
        wantId: true,
      },
    })

    // For efficient lookup, convert the existing pairs into a Set of unique strings.
    const existingPairs = new Set(
      existingSimilarities.map((sim) => `${sim.listingId}:${sim.wantId}`)
    )

    const missingSimilarities = []

    // 3. Generate all possible pairs (Cartesian product) and find the missing ones.
    for (const listing of searchData.listings) {
      for (const want of searchData.wantlist) {
        const pairKey = `${listing.id}:${want.id}`
        // If the generated pair does NOT exist in our Set, it's a missing one.
        if (!existingPairs.has(pairKey)) {
          missingSimilarities.push({
            listingId: listing.id,
            wantId: want.id,
          })
        }
      }
    }

    return missingSimilarities
  },
}
