import { z } from "zod"

// elysia api schema

export const InitiateDigInput = z.object({
  collection: z.string(),
  listings: z.string()
})

export type TInitiateDigInput = z.infer<typeof InitiateDigInput>

// python server schema

export const EmbedInput = z.object({
  urls: z.string().array()
})

export type TEmbedInput = z.infer<typeof EmbedInput>

const Embedding = z.float32().array()

export const EmbedOutput = z.object({
  embeddings: Embedding.array()
})

export type TEmbedOutput = z.infer<typeof EmbedOutput>