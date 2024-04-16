# @trpc-limiter/redis

Redis Rate Limiter Adapter for tRPC Limiter.

## Install

```bash
npm install @trpc-limiter/redis@latest redis@latest
```

Get your redis credentials from [Here](https://app.redislabs.com/#/databases)

## Usage

```ts
import { initTRPC } from '@trpc/server'
import { type NextApiRequest } from 'next'
import { createTrpcRedisLimiter, defaultFingerPrint } from '@trpc-limiter/redis'
import { createClient } from 'redis'

export const redis = createClient({
  password: '...',
  socket: {
    host: '...',
    port: 18382,
  },
  disableOfflineQueue: true,
})

type Context = {
  req: NextApiRequest
}

const t = initTRPC.context<Context>().create()

const rateLimiter = createTrpcRedisLimiter<typeof t>({
  fingerprint: (ctx) => defaultFingerPrint(ctx.req),
  message: (hitInfo) => `Too many requests, please try again later. ${hitInfo}`,
  max: 15,
  windowMs: 10000,
  redisClient: redis,
})

export const rateLimitedProcedure = t.procedure.use(rateLimiter)
```
