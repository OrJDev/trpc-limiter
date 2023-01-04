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
      return Math.ceil((resetTime.getTime() - Date.now()) / 1000) // rertyAfter in seconds
    }
    return null // if request should not be blocked, return null
  },
})
```

## Custom Adapter - Use

```ts
import { initTRPC, TRPCError } from '@trpc/server'
import type { IContext } from './context'
import { createTRPCStoreLimiter } from '@trpc-limiter/memory'

type IContext = {
  req: Request // your request type
}

export const root = initTRPC.context<IContext>().create()

const limiter = createTRPCStoreLimiter({
  root,
  fingerprint: (ctx) => ctx.req.headers.get('x-forwarded-for') ?? '127.0.0.1', // return the ip from the request
  windowMs: 20000,
  message: (retryAfter) =>
    `Too many requests, please try again later. ${retryAfter}`,
  max: 15,
  onLimit: (retryAfter, _ctx, fingerprint) => {
    console.log(retryAfter, fingerprint)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Too many requests unique',
    })
  },
})

export const rateLimitedProcedure = root.procedure.use(limiter)
```
