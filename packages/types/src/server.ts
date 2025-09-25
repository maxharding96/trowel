import { z } from 'zod'

export const Embedding = z.float32().array()

export type Embedding = z.infer<typeof Embedding>

export const EmbedInputSchema = z.object({
  id: z.string(),
  uri: z.string(),
})

export type EmbedInput = z.infer<typeof EmbedInputSchema>

export const EmbedOutputSchema = z.object({
  id: z.string(),
  embedding: Embedding,
})

export type EmbedOutput = z.infer<typeof EmbedOutputSchema>
