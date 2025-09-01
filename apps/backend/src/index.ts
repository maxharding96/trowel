import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { addProcessJob } from './queues'
import { searchRepositry } from '@trowel/db'

const app = new Elysia()
  .use(cors())
  .post(
    '/initiateDig',
    async ({ body }) => {
      const search = await searchRepositry.create({ id: 'test-id' })

      return search

      // const job = await addProcessJob(params)

      // console.log('Job added:', job.id)
    },
    {
      body: t.Object({
        wantlist: t.String(),
        listings: t.String(),
      }),
    }
  )
  .listen(3000)

export type App = typeof app

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
