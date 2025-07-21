import { z } from 'zod'

// backend api schema

export const InitiateDigInput = z.object({
  collection: z.string(),
  listings: z.string(),
})

export type TInitiateDigInput = z.infer<typeof InitiateDigInput>

// python server schema

export const EmbedInput = z.object({
  urls: z.string().array(),
})

export type TEmbedInput = z.infer<typeof EmbedInput>

const Embedding = z.float32().array()

export const EmbedOutput = z.object({
  embeddings: Embedding.array(),
})

export type TEmbedOutput = z.infer<typeof EmbedOutput>

// discogs api schema

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

const Status = z.enum([
  'All',
  'Deleted',
  'Draft',
  'Expired',
  'For Sale',
  'Pending',
  'Sold',
  'Suspended',
  'Violation',
])

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

const Release = z.object({
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

const WantlistItem = z.object({
  id: z.int(),
  resource_url: z.string(),
})

const ListingsItem = z.object({
  id: z.int(),
  status: Status,
  price: Price,
  allow_offers: z.boolean(),
  condition: Condition,
  sleeve_condition: Condition,
  ships_from: z.string(),
  uri: z.string(),
  comments: z.string(),
  release: Release,
  resource_url: z.string(),
  audio: z.boolean(),
})

export const GetWantlistInput = z.object({
  username: z.string(),
  pagination: PaginationParams.optional(),
})

export type TGetWantlistInput = z.infer<typeof GetWantlistInput>

export const GetWantlistOutput = z.object({
  pagination: Pagination,
  wants: WantlistItem.array(),
})

export type TGetWantlistOutput = z.infer<typeof GetWantlistInput>

export const GetListingsInput = z.object({
  username: z.string(),
  pagination: PaginationParams.optional(),
})

export type TGetListingsInput = z.infer<typeof GetListingsInput>

export const GetListingsOutput = z.object({
  pagination: Pagination,
  listings: ListingsItem.array(),
})

export type TGetListingsOutput = z.infer<typeof GetListingsOutput>

export const GetReleaseInput = z.object({
  release_id: z.int(),
})

export type TGetReleaseInput = z.infer<typeof GetReleaseInput>
