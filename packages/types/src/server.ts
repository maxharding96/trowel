import { z } from 'zod'

export const Embedding = z.float32().array().array()

export type Embedding = z.infer<typeof Embedding>

export const VideoInput = z.object({
  id: z.string(),
  uri: z.string(),
})

export const VideoOutput = z.object({
  id: z.string(),
  embedding: Embedding,
})

export const EmbedInputSchema = z.object({
  videos: VideoInput.array(),
})

export type EmbedInput = z.infer<typeof EmbedInputSchema>

export const EmbedOutputSchema = z.object({
  videos: VideoOutput.array(),
})

export type EmbedOutput = z.infer<typeof EmbedOutputSchema>
