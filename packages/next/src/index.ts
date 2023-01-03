import {
  createRateLimiterWrapper,
  createGetIPFunc,
  verifyIP,
  defineMiddleware,
} from '@trpc-limiter/core'
import { type NextApiResponse, type NextApiRequest } from 'next'

export const createTRPCNextLimiter = defineMiddleware(
  createRateLimiterWrapper(
    createGetIPFunc<NextApiRequest>((req) => {
      return verifyIP(
        req?.headers['x-forwarded-for'] ?? req?.socket.remoteAddress
      )
    }),
    (name, value, res: NextApiResponse) => {
      return res.setHeader(name, value)
    }
  )
)
