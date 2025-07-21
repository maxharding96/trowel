
import { Elysia } from "elysia"
import { cors } from '@elysiajs/cors'

const app = new Elysia().use(cors()).get("/dig/:collection/:listings", ({ params }) => {
  console.log("Received params:", params);
  return `Hello Elysia - Collection: ${params.collection}, Listings: ${params.listings}`;
}).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
