import prisma from '../client'
import type { Listing, Release } from '@trowel/types'
import { toStatusDB, toConditionDB, toSleeveConditionDB } from '../mapper'

export const listingRepositry = {
  async addRelease({ id, release }: { id: string; release: Release }) {
    const listing = await prisma.listing.update({
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

    if (!listing.release) {
      throw new Error('Failed to add release to listing')
    }

    return listing.release
  },

  connectRelease({ id, releaseId }: { id: string; releaseId: string }) {
    return prisma.listing.update({
      where: { id },
      data: {
        release: {
          connect: { id: releaseId },
        },
      },
    })
  },

  async upsertMany({
    searchId,
    listings,
  }: {
    searchId: string
    listings: Listing[]
  }) {
    const listingsDB = []

    for (const listing of listings) {
      const listingDB = await prisma.listing.upsert({
        where: { externalId: listing.id },
        create: {
          externalId: listing.id,
          status: toStatusDB(listing.status),
          allowOffers: listing.allow_offers,
          condition: toConditionDB(listing.condition),
          sleeveCondition: toSleeveConditionDB(listing.sleeve_condition),
          shipsFrom: listing.ships_from,
          comments: listing.comments,
          uri: listing.uri,
          resourceUrl: listing.resource_url,
          price: {
            create: listing.price,
          },
          search: { connect: { id: searchId } },
        },
        update: {
          status: toStatusDB(listing.status),
          allowOffers: listing.allow_offers,
          condition: toConditionDB(listing.condition),
          sleeveCondition: toSleeveConditionDB(listing.sleeve_condition),
          price: {
            update: listing.price,
          },
          search: { connect: { id: searchId } },
        },
        select: { id: true, externalId: true },
      })

      listingsDB.push(listingDB)
    }

    return listingsDB
  },

  getAllEmbeddedVideos(id: string) {
    return prisma.video.findMany({
      where: {
        release: {
          listings: {
            some: {
              id: {
                equals: id,
              },
            },
          },
        },
        status: 'SUCCESS',
      },
    })
  },
}
