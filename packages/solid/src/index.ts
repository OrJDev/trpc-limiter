import {
  createRateLimiterWrapper,
  createGetIPFunc,
  verifyIP,
  type ILimiterCore,
} from '@trpc-limiter/core'

export const createTRPCSolidLimiter = createRateLimiterWrapper(
  createGetIPFunc<Request>((req) => {
    return verifyIP(req?.headers.get('x-forwarded-for'))
  }),
  (name, value, res: Record<string, string>) => {
    return (res[name] = value)
  }
) as ILimiterCore
