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

### Usage

```ts
import {
  createRateLimiterWrapper,
  createGetIPFunc,
  defineMiddleware,
} from '@trpc-limiter/core'

type MyRequestType = { headers: Record<string, string> } // ?
type MyRes = { setHeader: (name: string, value: any) => void }

export const createTRPLimiter = defineMiddleware(
  createRateLimiterWrapper(
    // return the ip from the request
    createGetIPFunc<MyRequestType>((req) => req?.headers['x-forwarded-for']),
    (name, value, res: MyRes) => {
      return res.setHeader(name, value) // set the header
    }
  )
)
```
