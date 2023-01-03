import {
  createTRPCRateLimiter,
  type TRPCRateLimitOptions,
  createGetIPFunc,
  type ILimiterCore,
} from '@trpc-limiter/core'
import { type NextApiResponse, type NextApiRequest } from 'next'

const getReqIP = createGetIPFunc<NextApiRequest>((req) => {
  const base = req?.headers['x-forwarded-for'] ?? req?.socket.remoteAddress
  if (Array.isArray(base)) return base[0]
  return base
})

export const createTRPCNextLimiter: ILimiterCore = (
  opts: TRPCRateLimitOptions
) => {
  return createTRPCRateLimiter<NextApiResponse>(
    opts,
    getReqIP,
    (name, value, res) => {
      res.setHeader(name, value)
    }
  )
}
