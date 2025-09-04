import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { searchRepositry } from '@trowel/db'
import { addGetListingsJob, addGetWantlistJob } from './queues/discogs'

const app = new Elysia()
  .use(cors())
  .post(
    '/initiateDig',
    async ({ body }) => {
      await addGetListingsJob({ username: body.listings })

      await addGetWantlistJob({ username: body.wantlist })

      const search = await searchRepositry.create()

      return search
    },
    {
      body: t.Object({
        wantlist: t.String(),
        listings: t.String(),
      }),
    }
  )
  .get('/wantlist/:searchId', async ({ params }) => {
    const wantlist = await searchRepositry.getWantlist(params.searchId)

    return wantlist
  })
  .get('/listings/:searchId', async ({ params }) => {
    const listings = await searchRepositry.getListings(params.searchId)

    return listings
  })
  .listen(3000)

export type App = typeof app

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
