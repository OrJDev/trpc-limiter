import { asLimiterCore, defineTRPCLimiter } from '@trpc-limiter/core'

export const createTRPCSolidLimiter = asLimiterCore<
  Request,
  { headers: Record<string, unknown> }
>(
  defineTRPCLimiter(
    (req) => req.headers.get('x-forwarded-for'),
    (name, value, res) => {
      return (res.headers[name] = value)
    }
  )
)
