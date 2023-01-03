# tRPC Limiter

An open source, tRPC rate limiter middleware inspired by [express-rate-limiter](https://github.com/express-rate-limit/express-rate-limit).

## Install

```bash
npm install @trpc-limiter/core@latest
```

## Usage

### NextJS

```ts
import { initTRPC } from '@trpc/server'
import { createTRPCLimiter } from '@trpc-limiter/core'
import { type NextApiRequest } from 'next'

type Context = {
  req: NextApiRequest
  // ..etc
}

const root = initTRPC.context<Context>().create()

const getFingerPrint = (req: Context['req']) => {
  const ip = req.socket.remoteAddress ?? req.headers['x-forwarded-for']
  return (Array.isArray(ip) ? ip[0] : ip) ?? '127.0.0.1'
}

export const rateLimiter = createTRPCLimiter({
  root,
  fingerprint: (ctx) => getFingerPrint(ctx.req),
  windowMs: 10000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(rateLimiter)
```

### SolidStart

```ts
import { initTRPC } from '@trpc/server'
import { createTRPCLimiter } from '@trpc-limiter/core'

type Context = {
  req: Request
  // ..etc
}

export const root = initTRPC.context<Context>().create()

const limiter = createTRPCLimiter({
  root,
  fingerprint: (ctx) => ctx.req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  windowMs: 20000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(limiter)
```

### message

A `message` can be either a function that takes `hitInfo`, tRPC `ctx` and `fingerprint` or a string.

as a function

```ts
const opts = {
  message: (hitInfo, ctx, fingerprint) =>
    `Too many requests, please try again later. ${hitInfo.retryAfter}`,
}
```

as a string

```ts
const opts = {
  message: 'Too many requests, please try again later.',
}
```

### onLimit

`onLimit` is a function that will be called when the request is blocked.

```ts
const opts = {
  onLimit: (hitInfo, ctx, fingerprint) => {
    console.log(hitInfo, ctx, fingerprint)
  },
}
```

### shouldThrow

When `shouldThrow` is set to false the middleware will not throw a tRPC error when the request is blocked, instead use the `onLimit` function to throw / debug the request.

```ts
const opts = {
  shouldThrow: false, // this will prevent the middleware to throw the error and let you throw your own error
  onLimit: (hitInfo, ctx, fingerprint) => {
    console.log(hitInfo, ctx, fingerprint)
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'you are blocked',
    })
  },
}
```

This project was created because of this tRPC [issue](https://github.com/trpc/trpc/issues/3227) opened by the creator of tRPC.
