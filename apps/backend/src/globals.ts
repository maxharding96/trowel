import { DiscogsClient, ServerClient } from './clients'

//! DO NOT COMMIT
const DISCOGS_KEY = 'oRXQpXiCrfgljmEEnaPL'
const DISCOGS_SECRET = 'woTigFgLtihOZYEnzDLeXQfatXdfXkYV'

export const discogs = new DiscogsClient({
  key: DISCOGS_KEY,
  secret: DISCOGS_SECRET,
})

const SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:8000'

export const server = new ServerClient(SERVER_BASE_URL)
