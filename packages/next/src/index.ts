import { type NextApiResponse, type NextApiRequest } from 'next'
import { asLimiterCore, defineTRPCLimiter } from '@trpc-limiter/core'

export const createTRPCNextLimiter = asLimiterCore<
  NextApiRequest,
  NextApiResponse
>(
  defineTRPCLimiter(
    (req) => req?.headers['x-forwarded-for'] ?? req?.socket.remoteAddress,
    (name, value, res) => {
      return res.setHeader(name, value)
    }
  )
)
