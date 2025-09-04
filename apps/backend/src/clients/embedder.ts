import type { EmbedInput, EmbedOutput } from '@trowel/types'
import { EmbedOutputSchema } from '@trowel/types'
import { RestClient } from './rest'

export class EmbedderClient extends RestClient {
  constructor(baseUrl: string) {
    super(baseUrl, { 'Content-Type': 'application/json' })
  }

  async process(input: EmbedInput): Promise<EmbedOutput> {
    const unsafeResponse = await this.post<EmbedInput, EmbedOutput>(
      '/embed',
      input
    )
    const response = EmbedOutputSchema.parse(unsafeResponse)

    return response
  }
}
