import prisma from '../client'
import type { Listing } from '@trowel/types'

export const listingsRepositry = {
  createMany({
    searchId,
    listings,
  }: {
    searchId: string
    listings: Listing[]
  }) {
    return prisma.listing.createMany({
      data: listings.map((listing) => ({
        ...listing,
        searchId,
      })),
      skipDuplicates: true,
    })
  },
}
