import type {
  GetListingsInput,
  GetListingsOutput,
  GetWantlistInput,
  GetWantlistOutput,
  GetReleaseInput,
  Release,
} from '@trowel/types'
import {
  ReleaseSchema,
  GetListingsOutputSchema,
  GetWantlistOutputSchema,
} from '@trowel/types'
import { RestClient } from './rest'

const BASE_URL = 'https://api.discogs.com'
const USER_AGENT = 'Trowel/1.0 (+https://trowel.vercel.app/)'

export class DiscogsClient extends RestClient {
  key: string
  secret: string

  constructor({ key, secret }: { key: string; secret: string }) {
    super(BASE_URL, { 'User-Agent': USER_AGENT })

    this.key = key
    this.secret = secret
  }

  async getRelease(input: GetReleaseInput): Promise<Release> {
    const path = this.getPath(`/releases/${input.releaseId}`)

    const unsafeResponse = await this.get<Release>(path)

    const response = ReleaseSchema.parse(unsafeResponse)

    return response
  }

  async getListings(input: GetListingsInput): Promise<GetListingsOutput> {
    const path = this.getPath(
      `/users/${input.username}/inventory`,
      input.pagination
    )

    const unsafeResponse = await this.get<GetListingsOutput>(path)
    const response = GetListingsOutputSchema.parse(unsafeResponse)

    return response
  }

  async getWantlist(input: GetWantlistInput): Promise<GetWantlistOutput> {
    const path = this.getPath(
      `/users/${input.username}/wants`,
      input.pagination
    )

    const unsafeResponse = await this.get<GetWantlistOutput>(path)
    const response = GetWantlistOutputSchema.parse(unsafeResponse)

    return response
  }

  private getPath(ext: string, params?: Record<string, string | number>) {
    const searchParams = new URLSearchParams({
      key: this.key,
      secret: this.secret,
      ...params,
    })

    return ext + '?' + searchParams.toString()
  }
}
