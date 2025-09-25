import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { searchRepositry } from '@trowel/db'
import { addSearchJob } from './queues/search'
import { addSimilarityJob } from './queues/similarity'

const app = new Elysia()
  .use(cors())
  .post(
    '/initiate',
    async ({ body }) => {
      const search = await searchRepositry.create()

      await addSearchJob({
        searchId: search.id,
        ...body,
      })

      return search
    },
    {
      body: t.Object({
        wantlist: t.String(),
        listings: t.String(),
      }),
    }
  )

  .get('/search/:searchId', async ({ params }) => {
    const { searchId } = params

    const [
      wantlistCount,
      listingsCount,
      embeddedWantlistCount,
      embeddedListingsCount,
    ] = await searchRepositry.getCounts(searchId)

    const similarities = await searchRepositry.getBestSimilarities({
      searchId,
      minScore: 0.9,
    })

    //TODO very hacky
    void addSimilarityJob({ searchId })

    return {
      similarities,
      counts: {
        wantlist: wantlistCount,
        listings: listingsCount,
        embeddedWantlist: embeddedWantlistCount,
        embeddedListings: embeddedListingsCount,
      },
    }
  })

  .listen(3000)

export type App = typeof app

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
