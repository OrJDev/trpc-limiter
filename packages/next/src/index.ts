import {
  createRateLimiterWrapper,
  createGetIPFunc,
  verifyIP,
  type ILimiterCore,
} from '@trpc-limiter/core'
import { type NextApiResponse, type NextApiRequest } from 'next'

export const createTRPCNextLimiter = createRateLimiterWrapper(
  createGetIPFunc<NextApiRequest>((req) => {
    return verifyIP(
      req?.headers['x-forwarded-for'] ?? req?.socket.remoteAddress
    )
  }),
  (name, value, res: NextApiResponse) => {
    return res.setHeader(name, value)
  }
) as ILimiterCore
