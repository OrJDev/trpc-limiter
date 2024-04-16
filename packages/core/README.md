# @trpc-limiter/core

The core of tRPC limiter.

## Current Adapters

- [Upstash / Redis](https://github.com/OrJDev/trpc-limiter/tree/main/packages/upstash)
- [Memory Store](https://github.com/OrJDev/trpc-limiter/tree/main/packages/memory)

## Custom Adapter - Create

```ts
import { defineTRPCLimiter } from '@trpc-limiter/core'
import { MemoryStore } from './store'

export const createTRPCStoreLimiter = defineTRPCLimiter({
  store: (opts) => new MemoryStore(opts), // this store will be created when defining the middleware
  isBlocked: async (store, fingerPrint, opts) => {
    // inferred store from above
    const { totalHits, resetTime } = await store.increment(fingerPrint)
    if (totalHits > opts.max) {
      // this will be inferred and will be used as the first paramter of onLimit
      return Math.ceil((resetTime.getTime() - Date.now()) / 1000)
    }
    return null // if request should not be blocked, return null
  },
})
```

## Custom Adapter - Use

```ts
import { initTRPC, TRPCError } from '@trpc/server'
import {
  createTRPCStoreLimiter,
  defaultFingerPrint,
} from '@trpc-limiter/memory'

// trpc context type
type IContext = {
  req: Request
}

export const root = initTRPC.context<IContext>().create()

const limiter = createTRPCStoreLimiter({
  fingerprint: (ctx, _input) => defaultFingerPrint(ctx.req), // return the ip from the request
  windowMs: 20000,
  // hitInfo is inferred from the return type of `isBlocked`, its a number in this case
  message: (hitInfo) => `Too many requests, please try again later. ${hitInfo}`,
  max: 15,
  onLimit: (hitInfo, _ctx, fingerprint) => {
    console.log(hitInfo, fingerprint)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Too many requests unique',
    })
  },
})

export const rateLimitedProcedure = root.procedure.use(limiter)
```

## defaultFingerPrint

The `defaultFingerPrint` function is exported from every adapter, it basically tries and fetch the IP from the request supporting both NextJS & SolidStart (Fetch).

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
