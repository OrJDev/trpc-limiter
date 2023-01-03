# @trpc-limiter/solid

tRPC rate limiter for SolidStart.

## Install

```bash
npm install @trpc-limiter/solid
```

## Usage

```ts
import { createTRPCSolidLimiter } from '@trpc-limiter/solid'
import { initTRPC } from '@trpc/server'

const root = initTRPC.create()

const limiter = createTRPCSolidLimiter({
  root,
  windowMs: 10000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(limiter)
```
