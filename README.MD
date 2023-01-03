# tRPC Limiter

An open source, tRPC rate limiter middleware inspired by [express-rate-limiter](https://github.com/express-rate-limit/express-rate-limit).

## Supported Frameworks

- [NextJS](https://nextjs.org/) - [Docs](https://github.com/OrJDev/trpc-limiter/tree/main/packages/next)
- [SolidStart](https://start.solidjs.com) - [Docs](https://github.com/OrJDev/trpc-limiter/tree/main/packages/solid)
- [Custom Framework](https://github.com/OrJDev/trpc-limiter/tree/main/packages/core)

## Typesafety

Ofc tRPC is all about typesafety, so tRPC limiter is also about typesafety, here is an example usage of NextJS:

```ts
import { createTRPCNextLimiter } from '@trpc-limiter/next'
import { initTRPC } from '@trpc/server'

const root = initTRPC.create()

const limiter = createTRPCNextLimiter({
  root,
  // ctx is typesafed and inferred from the root
  getReq: (ctx) => ctx.req, // Expected `NextApiRequest`
  getRes: (ctx) => ctx.res, // Expected `NextApiResponse`
  windowMs: 10000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(limiter)
```

This project was created because of this tRPC [issue](https://github.com/trpc/trpc/issues/3227) opened by the creator of tRPC.
