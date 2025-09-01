import { z } from 'zod'

export const InitiateDigInputSchema = z.object({
  wantlist: z.string(),
  listings: z.string(),
})

export type InitiateDigInput = z.infer<typeof InitiateDigInputSchema>
