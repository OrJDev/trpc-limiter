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
import {
  createTRPCStoreLimiter,
  defaultFingerPrint,
} from '@trpc-limiter/memory'

type IContext = {
  req: Request // your request type
}

export const root = initTRPC.context<IContext>().create()

const limiter = createTRPCStoreLimiter<typeof root>({
  fingerprint: (ctx) => defaultFingerPrint(ctx.req),
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

```ts
import { initTRPC } from '@trpc/server'
import { type NextApiRequest } from 'next'
import {
  createTRPCStoreLimiter,
  defaultFingerPrint,
} from '@trpc-limiter/memory'

type Context = {
  req: NextApiRequest
}

const t = initTRPC.context<Context>().create()

const rateLimiter = createTRPCStoreLimiter<typeof t>({
  fingerprint: (ctx) => defaultFingerPrint(ctx.req),
  message: (hitInfo) =>
    `Too many requests, please try again later. ${Math.ceil(
      (hitInfo.reset - Date.now()) / 1000
    )}`,
  max: 15,
  windowMs: 10000,
})

export const rateLimitedProcedure = t.procedure.use(rateLimiter)
```
