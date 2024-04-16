# @trpc-limiter/upstash

Upstash Rate Limiter Adapter for tRPC Limiter.

## Install

```bash
npm install @trpc-limiter/upstash@latest @upstash/ratelimit@latest @upstash/redis@latest
```

## Enviroment Variables

Both `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are required. an error will be thrown (in this example) if they are not provided

- UPSTASH_REDIS_REST_TOKEN=...
- UPSTASH_REDIS_REST_URL=...

Check [This Blog](https://upstash.com/blog/upstash-ratelimit) For More Info.

## Usage

```ts
import { initTRPC } from '@trpc/server'
import { type NextApiRequest } from 'next'
import {
  createTRPCUpstashLimiter,
  defaultFingerPrint,
} from '@trpc-limiter/upstash'
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

type Context = {
  req: NextApiRequest
}

const t = initTRPC.context<Context>().create()

const rateLimiter = createTRPCUpstashLimiter<typeof t>({
  fingerprint: (ctx) => defaultFingerPrint(ctx.req),
  message: (hitInfo) =>
    `Too many requests, please try again later. ${Math.ceil(
      (hitInfo.reset - Date.now()) / 1000
    )}`,
  max: 15,
  windowMs: 10000,
  rateLimitOpts(opts) {
    return {
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(opts.max, `${opts.windowMs} ms`),
    }
  },
})

export const rateLimitedProcedure = t.procedure.use(rateLimiter)
```
