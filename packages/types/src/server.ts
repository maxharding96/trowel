import { z } from 'zod'

export const EmbedInputSchema = z.object({
  urls: z.string().optional().array(),
})

export type EmbedInput = z.infer<typeof EmbedInputSchema>

const Embedding = z.float32().array().array()

export const EmbedOutputSchema = z.object({
  embeddings: Embedding.array(),
})

export type EmbedOutput = z.infer<typeof EmbedOutputSchema>
