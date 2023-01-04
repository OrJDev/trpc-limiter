import { defineTRPCLimiter } from '@trpc-limiter/core'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const createTRPCUpstashLimiter = defineTRPCLimiter({
  store: (opts) =>
    new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(opts.max, `${opts.windowMs} ms`),
    }),
  async isBlocked(store, fingerprint) {
    const { success, pending, ...rest } = await store.limit(fingerprint)
    await pending
    return success ? null : rest
  },
})
