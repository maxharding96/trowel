import type {
  TGetListingsInput,
  TGetListingsOutput,
  TGetWantlistInput,
  TGetWantlistOutput,
  TGetReleaseInput,
} from '@trowel/types'
import { RestClient } from './rest'

const BASE_URL = 'https://api.discogs.com'
const USER_AGENT = 'Trowel/1.0 (+https://trowel.app)'

export class DiscogsClient extends RestClient {
  constructor() {
    const headers = {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/json',
    }

    super(BASE_URL, headers)
  }

  async getRelease(input: TGetReleaseInput): Promise<TGetReleaseInput> {
    const response = await this.get<TGetReleaseInput>(
      `/releases/${input.release_id}`
    )
    return response
  }

  async getListings(input: TGetListingsInput): Promise<TGetListingsOutput> {
    let path = `/users/${input.username}/inventory`

    if (input.pagination) {
      const { page, per_page } = input.pagination
      path += `?page=${page}&per_page=${per_page}`
    }

    const response = await this.get<TGetListingsOutput>(path)
    return response
  }

  async getWantlist(input: TGetWantlistInput): Promise<TGetWantlistOutput> {
    let path = `/users/${input.username}/wants`

    if (input.pagination) {
      const { page, per_page } = input.pagination
      path += `?page=${page}&per_page=${per_page}`
    }

    const response = await this.get<TGetWantlistOutput>(path)
    return response
  }
}
