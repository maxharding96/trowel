import { z } from 'zod'

const PaginationParams = z.object({
  page: z.int(),
  per_page: z.int().max(100),
})

const Pagination = z.object({
  per_page: z.int(),
  pages: z.int(),
  page: z.int(),
  items: z.int(),
})

const Status = z.enum(['For Sale', 'Draft'])

const Currency = z.enum([
  'USD',
  'GBP',
  'EUR',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'MXN',
  'BRL',
  'NZD',
  'SEK',
  'ZAR',
])

const Price = z.object({
  currency: Currency,
  value: z.number(),
})

const Condition = z.enum([
  'Mint (M)',
  'Near Mint (NM or M-)',
  'Very Good Plus (VG+)',
  'Very Good (VG)',
  'Good Plus (G+)',
  'Good (G)',
  'Fair (F)',
  'Poor (P)',
])

const SleeveCondition = z.enum([
  'Mint (M)',
  'Near Mint (NM or M-)',
  'Very Good Plus (VG+)',
  'Very Good (VG)',
  'Good Plus (G+)',
  'Good (G)',
  'Fair (F)',
  'Poor (P)',
  'Generic',
  'Not Graded',
  'No Cover',
])

const Artist = z.object({
  id: z.int(),
  name: z.string(),
  resource_url: z.string(),
})

const Track = z.object({
  duration: z.string(),
  position: z.string(),
  title: z.string(),
})

const Video = z.object({
  description: z.string().nullable(),
  duration: z.int(),
  embed: z.boolean(),
  title: z.string(),
  uri: z.string(),
})

const PartialRelease = z.object({
  catalog_number: z.string(),
  resource_url: z.string(),
  year: z.number(),
  id: z.int(),
  description: z.string(),
  artist: z.string(),
  title: z.string(),
  format: z.string(),
  thumbnail: z.string(),
})

export const ReleaseSchema = z.object({
  title: z.string(),
  id: z.int(),
  artists: Artist.array(),
  thumb: z.string(),
  country: z.string(),
  genres: z.string().array(),
  lowest_price: z.number().nullable(),
  num_for_sale: z.number(),
  resource_url: z.string(),
  status: z.string(),
  styles: z.string().array(),
  tracklist: Track.array(),
  uri: z.string(),
  videos: Video.array(),
  year: z.number(),
})

export type Release = z.infer<typeof ReleaseSchema>

const WantSchema = z.object({
  id: z.int(),
  resource_url: z.string(),
})

export type Want = z.infer<typeof WantSchema>

const ListingSchema = z.object({
  id: z.int(),
  status: Status,
  price: Price,
  allow_offers: z.boolean(),
  condition: Condition,
  sleeve_condition: SleeveCondition,
  ships_from: z.string(),
  uri: z.string(),
  comments: z.string(),
  release: ReleaseSchema.or(PartialRelease),
  resource_url: z.string(),
  audio: z.boolean(),
})

export type Listing = z.infer<typeof ListingSchema>

export const GetWantlistInputSchema = z.object({
  username: z.string(),
  pagination: PaginationParams.optional(),
})

export type GetWantlistInput = z.infer<typeof GetWantlistInputSchema>

export const GetWantlistOutputSchema = z.object({
  pagination: Pagination,
  wants: WantSchema.array(),
})

export type GetWantlistOutput = z.infer<typeof GetWantlistOutputSchema>

export const GetListingsInputSchema = z.object({
  username: z.string(),
  pagination: PaginationParams.optional(),
})

export type GetListingsInput = z.infer<typeof GetListingsInputSchema>

export const GetListingsOutputSchema = z.object({
  pagination: Pagination,
  listings: ListingSchema.array(),
})

export type GetListingsOutput = z.infer<typeof GetListingsOutputSchema>

export const GetReleaseInputSchema = z.object({
  release_id: z.int(),
})

export type GetReleaseInput = z.infer<typeof GetReleaseInputSchema>
