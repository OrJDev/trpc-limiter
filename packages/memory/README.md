# @trpc-limiter/memory

Memory store adapter for tRPC limiter.

## Install

```bash
npm install @trpc-limiter/memory@latest
```

## Usage

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
  fingerprint: (ctx, _input) =>
    ctx.req.headers.get('x-forwarded-for') ?? '127.0.0.1', // return the ip from the request
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
