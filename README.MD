# tRPC Limiter

An open source, tRPC rate limiter middleware.

## Adapters

- [Redis](https://github.com/OrJDev/trpc-limiter/tree/main/packages/redis)
- [Upstash](https://github.com/OrJDev/trpc-limiter/tree/main/packages/upstash)
- [Memory Store](https://github.com/OrJDev/trpc-limiter/tree/main/packages/memory)
- [Custom](https://github.com/OrJDev/trpc-limiter/tree/main/packages/core)

This project was created because of this tRPC [issue](https://github.com/trpc/trpc/issues/3227) opened by the creator of tRPC.

## Note

Make sure to use the `next` version of tRPC. Meaning when installing a tRPC related package, make sure to install the `@next` version.

```bash
pnpm install @trpc/server@next @trpc/client@next ...
```

```ts
import {
  createTRPCStoreLimiter,
  defaultFingerPrint,
} from '@trpc-limiter/memory'

// or

import {
  createTRPCUpstashLimiter,
  defaultFingerPrint,
} from '@trpc-limiter/upstash'

// or

import { createTrpcRedisLimiter, defaultFingerPrint } from '@trpc-limiter/redis'
```

## Example (Redis)

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
  message: (hitInfo) =>
    `Too many requests, please try again later. ${Math.ceil(
      (hitInfo.reset - Date.now()) / 1000
    )}`,
  max: 15,
  windowMs: 10000,
  redisClient: redis,
})

export const rateLimitedProcedure = t.procedure.use(rateLimiter)
```
