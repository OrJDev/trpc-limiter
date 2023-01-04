/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRPCError } from '@trpc/server'
import {
  type ILimiterAdapter,
  type AnyRootConfig,
  type TRPCRateLimitOptions,
} from './types'

const parseOptions = <TRoot extends AnyRootConfig, RType>(
  passed: TRPCRateLimitOptions<TRoot, RType>
) => {
  return {
    root: passed.root,
    windowMs: passed.windowMs ?? 60_000,
    max: passed.max ?? 5,
    message: passed.message ?? 'Too many requests, please try again later.',
    fingerprint: passed.fingerprint,
    onLimit: passed.onLimit,
  } as unknown as Required<TRPCRateLimitOptions<AnyRootConfig, RType>>
}

export * from './types'

export const defineTRPCLimiter = <
  RType,
  Store extends (
    opts: Required<TRPCRateLimitOptions<AnyRootConfig, RType>>
  ) => any
>(
  adapter: ILimiterAdapter<RType, Store>
) => {
  return <TRoot extends AnyRootConfig>(
    opts: TRPCRateLimitOptions<TRoot, RType>
  ) => {
    const options = parseOptions(opts)
    const store = adapter.store(options)
    const middleware = async ({ ctx, next }: any) => {
      const fp = await options.fingerprint(ctx)
      if (!fp) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No fingerprint returned',
        })
      }
      const retryAfter = await adapter.isBlocked(store, fp, options)
      if (retryAfter) {
        if (typeof options.onLimit === 'function') {
          await options.onLimit(retryAfter, ctx, fp)
        }
        const message =
          typeof options.message === 'function'
            ? await options.message(retryAfter, ctx, fp)
            : options.message
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message,
        })
      }
      return next()
    }
    return middleware
  }
}
