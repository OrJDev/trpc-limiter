import { type NextApiResponse, type NextApiRequest } from 'next'
import { asLimiterCore, defineTRPCLimiter } from '@trpc-limiter/core'

export const createTRPCNextLimiter = asLimiterCore<
  NextApiRequest,
  NextApiResponse
>(
  defineTRPCLimiter(
    (req) => req.socket.remoteAddress ?? req.headers['x-forwarded-for'],
    (name, value, res) => {
      return res.setHeader(name, value)
    }
  )
)
