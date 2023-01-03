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
