import {
  createTRPCRateLimiter,
  type TRPCRateLimitOptions,
  createGetIPFunc,
  type ILimiterCore,
} from '@trpc-limiter/core'

const getReqIP = createGetIPFunc<Request>((req) => {
  const base = req?.headers.get('x-forwarded-for')
  if (Array.isArray(base)) return base[0]
  return base
})

export const createTRPCSolidLimiter: ILimiterCore = (
  opts: TRPCRateLimitOptions
) => {
  return createTRPCRateLimiter(opts, getReqIP, (name, value, res) => {
    res[name] = value
  })
}
