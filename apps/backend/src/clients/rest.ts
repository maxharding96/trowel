export abstract class RestClient {
  protected baseUrl: string
  protected headers: Record<string, string>

  constructor(baseUrl: string, headers: Record<string, string>) {
    this.baseUrl = baseUrl
    this.headers = headers
  }

  protected async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.headers,
    })
    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status}`)
    }

    return response.json()
  }

  protected async post<I, O>(path: string, input?: I): Promise<O> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error(`POST ${path} failed: ${response.status}`)
    }

    return response.json()
  }
}
