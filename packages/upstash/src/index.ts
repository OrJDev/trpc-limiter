import {
  defineLimiterWithProps,
  BaseOpts,
  AnyRootConfig,
  defaultFingerPrint,
} from '@trpc-limiter/core'
import { Ratelimit } from '@upstash/ratelimit'
import { RegionRatelimitConfig } from '@upstash/ratelimit/types/single'

const isBlocked = async (store: Ratelimit, fingerprint: string) => {
  const { success, pending, ...rest } = await store.limit(fingerprint)
  await pending
  return success ? null : rest
}

export const createTRPCUpstashLimiter = defineLimiterWithProps<
  {
    rateLimitOpts: (
      opts: Required<BaseOpts<AnyRootConfig, any>>
    ) => RegionRatelimitConfig
  },
  NonNullable<Awaited<ReturnType<typeof isBlocked>>>
>(
  {
    store: (opts) => new Ratelimit(opts.rateLimitOpts(opts)),
    isBlocked,
  },
  (currnetState) => {
    return { rateLimitOpts: currnetState.rateLimitOpts }
  }
)

export { defaultFingerPrint } from '@trpc-limiter/core'
