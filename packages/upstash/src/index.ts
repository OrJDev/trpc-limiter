import {
  defineLimiterWithProps,
  BaseOpts,
  AnyRootConfig,
} from '@trpc-limiter/core'
import { Ratelimit } from '@upstash/ratelimit'
import { RegionRatelimitConfig } from '@upstash/ratelimit/types/single'

export const createTRPCUpstashLimiter = defineLimiterWithProps<{
  rateLimitOpts: (
    opts: Required<BaseOpts<AnyRootConfig, any>>
  ) => RegionRatelimitConfig
}>(
  {
    store: (opts) => new Ratelimit(opts.rateLimitOpts(opts)),
    async isBlocked(store, fingerprint) {
      const { success, pending, ...rest } = await store.limit(fingerprint)
      await pending
      return success ? null : rest
    },
  },
  (currnetState) => {
    return { rateLimitOpts: currnetState.rateLimitOpts }
  }
)

export { defaultFingerPrint } from '@trpc-limiter/core'
