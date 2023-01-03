import {
  createRateLimiterWrapper,
  createGetIPFunc,
  defineMiddleware,
} from '@trpc-limiter/core'

export const createTRPCSolidLimiter = defineMiddleware(
  createRateLimiterWrapper(
    createGetIPFunc<Request>((req) => req?.headers.get('x-forwarded-for')),
    (name, value, res: Record<string, string>) => {
      return (res[name] = value)
    }
  )
)
