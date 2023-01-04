# @trpc-limiter/upstash

Upstash Rate Limiter Adapter for tRPC Limiter.

## Install

```bash
npm install @trpc-limiter/upstash@latest
```

## Enviroment Variables

Both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are required. an error will be thrown if they are not provided

- UPSTASH_REDIS_REST_TOKEN=...
- UPSTASH_REDIS_REST_URL=...

Check [This Blog](https://upstash.com/blog/upstash-ratelimit) For More Info.

## Usage

```ts
import { initTRPC } from '@trpc/server'
import { createTRPCUpstashLimiter } from '@trpc-limiter/upstash'
import { type Context } from './context'
import { type NextApiRequest } from 'next'

type Context = {
  req: NextApiRequest
}
const root = initTRPC.context<Context>().create()

const getFingerPrint = (req: NextApiRequest) => {
  const ip = req.socket.remoteAddress ?? req.headers['x-forwarded-for']
  return (Array.isArray(ip) ? ip[0] : ip) ?? '127.0.0.1'
}
export const rateLimiter = createTRPCUpstashLimiter({
  root,
  fingerprint: (ctx, _input) => getFingerPrint(ctx.req),
  windowMs: 10000,
  message: (retryAfter) =>
    `Too many requests, please try again later. ${retryAfter}`,
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(rateLimiter)
```
