# @trpc-limiter/next

tRPC rate limiter for NextJS.

## Install

```bash
npm install @trpc-limiter/next
```

## Usage

```ts
import { createTRPCNextLimiter } from '@trpc-limiter/next'
import { initTRPC } from '@trpc/server'

const root = initTRPC.create()

const limiter = createTRPCNextLimiter({
  root,
  windowMs: 10000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(limiter)
```
