import {
  createRateLimiterWrapper,
  createGetIPFunc,
  verifyIP,
  defineMiddleware,
} from '@trpc-limiter/core'

export const createTRPCSolidLimiter = defineMiddleware(
  createRateLimiterWrapper(
    createGetIPFunc<Request>((req) => {
      return verifyIP(req?.headers.get('x-forwarded-for'))
    }),
    (name, value, res: Record<string, string>) => {
      return (res[name] = value)
    }
  )
)
