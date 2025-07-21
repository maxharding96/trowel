import type { TEmbedInput, TEmbedOutput } from '@trowel/types'

export class ServerClient {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async embed(input: TEmbedInput): Promise<TEmbedOutput> {
    const response = await this.post<TEmbedInput, TEmbedOutput>(input, '/embed')
    return response
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`)
    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status}`)
    }
    return response.json()
  }

  private async post<I, O>(input: I, path: string): Promise<O> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error(`POST ${path} failed: ${response.status}`)
    }
    return response.json()
  }
}
