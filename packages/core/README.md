# @trpc-limiter/core

The core of tRPC limiter.

## Supported Frameworks

- [@trpc-limiter/next](https://github.com/OrJDev/trpc-limiter/tree/main/packages/next)
- [@trpc-limiter/solid](https://github.com/OrJDev/trpc-limiter/tree/main/packages/solid)

## Custom Framework

### Install

```bash
npm install @trpc-limiter/core
```

### Usage - API

```ts
import { asLimiterCore, defineTRPCLimiter } from '@trpc-limiter/core'

type MyRequestType = { headers: Record<string, string> } // request type
type MyResponseType = { setHeader: (name: string, value: any) => void } // response type

export const createMyTRPCLimiter = asLimiterCore<MyRequestType, MyResponseType>(
  defineTRPCLimiter(
    (req) => req?.headers['x-forwarded-for'],
    (name, value, res) => {
      return res.setHeader(name, value)
    }
  )
)
```

### Usage - tRPC Middleware

```ts
import { initTRPC } from '@trpc/server'

type IContext = {
  req: MyRequestType
  res: MyResponseType
}

const root = initTRPC.context<IContext>().create()

const limiter = createMyTRPCLimiter({
  root,
  // ctx is typesafed and inferred from the root
  getReq: (ctx) => ctx.req, // Expected `MyRequestType`
  getRes: (ctx) => ctx.res, // Expected `MyResponseType`
  windowMs: 10000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(limiter)
```
