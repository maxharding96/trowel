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
        listingVideo: {
          select: {
            title: true,
            uri: true,
          },
        },
        wantVideo: {
          select: {
            title: true,
            uri: true,
          },
        },
      },
    })
  },

  async getMissingSimilarities(searchId: string) {
    const searchData = await prisma.search.findUnique({
      where: { id: searchId },
      select: {
        listings: {
          select: {
            release: {
              select: {
                videos: {
                  select: { id: true },
                },
              },
            },
          },
        },
        wantlist: {
          select: {
            release: {
              select: {
                videos: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    })

    if (!searchData) {
      return []
    }

    // Get all existing similarities for this search.
    const existingSimilarities = await prisma.similarity.findMany({
      where: {
        searchId,
      },
      select: {
        listingVideoId: true,
        wantVideoId: true,
      },
    })

    // For efficient lookup, convert the existing pairs into a Set of unique strings.
    const existingPairs = new Set(
      existingSimilarities.map(
        (sim) => `${sim.listingVideoId}:${sim.wantVideoId}`
      )
    )

    const missingSimilarities = []

    const listingVideoIds = new Set(
      searchData.listings.flatMap(
        (listing) => listing.release?.videos.map((video) => video.id) ?? []
      )
    )

    const wantlistVideoIds = new Set(
      searchData.wantlist.flatMap(
        (listing) => listing.release?.videos.map((video) => video.id) ?? []
      )
    )

    // Generate all possible pairs and find the missing ones.
    for (const l of listingVideoIds) {
      for (const w of wantlistVideoIds) {
        const pairKey = `${l}:${w}`
        // If the generated pair does NOT exist in our Set, it's a missing one.
        if (!existingPairs.has(pairKey)) {
          missingSimilarities.push({
            listingVideoId: l,
            wantVideoId: w,
          })
        }
      }
    }

    return missingSimilarities
  },

  getAllEmbeddedVideosInWantlist(id: string) {
    return prisma.video.findMany({
      where: {
        release: {
          wants: {
            some: {
              search: {
                some: {
                  id,
                },
              },
            },
          },
        },
        status: 'SUCCESS',
      },
    })
  },

  getAllEmbeddedVideosInListings(id: string) {
    return prisma.video.findMany({
      where: {
        release: {
          listings: {
            some: {
              search: {
                some: {
                  id,
                },
              },
            },
          },
        },
        status: 'SUCCESS',
      },
    })
  },
}
