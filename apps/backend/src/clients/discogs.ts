import type {
  TGetListingsInput,
  TGetListingsOutput,
  TGetWantlistInput,
  TGetWantlistOutput,
  TGetReleaseInput,
  TRelease,
} from '@trowel/types'
import { Release, GetListingsOutput, GetWantlistOutput } from '@trowel/types'
import { RestClient } from './rest'
import { awaitJob } from '../queues/discogs'

const BASE_URL = 'https://api.discogs.com'
const USER_AGENT = 'Trowel/1.0 (+https://trowel.vercel.app/)'

export class DiscogsClient extends RestClient {
  authParams: string

  constructor({ key, secret }: { key: string; secret: string }) {
    super(BASE_URL, { 'User-Agent': USER_AGENT })

    this.authParams = `key=${key}&secret=${secret}`
  }

  async getRelease(input: TGetReleaseInput): Promise<TRelease> {
    const path =
      this.baseUrl + `/releases/${input.release_id}` + '?' + this.authParams

    const unsafeResponse = await awaitJob({ path, headers: this.headers })
    const response = Release.parse(unsafeResponse)

    return response
  }

  async getListings(input: TGetListingsInput): Promise<TGetListingsOutput> {
    let path =
      this.baseUrl +
      `/users/${input.username}/inventory` +
      '?' +
      this.authParams

    if (input.pagination) {
      const { page, per_page } = input.pagination
      path += `&page=${page}&per_page=${per_page}`
    }

    const unsafeResponse = await awaitJob({ path, headers: this.headers })
    const response = GetListingsOutput.parse(unsafeResponse)

    return response
  }

  async getWantlist(input: TGetWantlistInput): Promise<TGetWantlistOutput> {
    let path =
      this.baseUrl + `/users/${input.username}/wants` + '?' + this.authParams

    if (input.pagination) {
      const { page, per_page } = input.pagination
      path += `&page=${page}&per_page=${per_page}`
    }

    const unsafeResponse = await awaitJob({ path, headers: this.headers })
    const response = GetWantlistOutput.parse(unsafeResponse)

    return response
  }
}
