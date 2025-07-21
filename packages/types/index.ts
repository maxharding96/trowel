import { z } from "zod"

export const formSchema = z.object({
  collection: z.string(),
  listings: z.string()
})

export type FormSchema = z.infer<typeof formSchema>