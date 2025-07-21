import type { TEmbedInput, TEmbedOutput } from '@trowel/types'
import { RestClient } from './rest'

export class ServerClient extends RestClient {
  constructor(baseUrl: string) {
    const headers = {
      'Content-Type': 'application/json',
    }

    super(baseUrl, headers)
  }

  async embed(input: TEmbedInput): Promise<TEmbedOutput> {
    const response = await this.post<TEmbedInput, TEmbedOutput>('/embed', input)
    return response
  }
}
