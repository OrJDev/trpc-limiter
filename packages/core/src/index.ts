/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRPCError } from '@trpc/server'
import {
  type ILimiterAdapter,
  type AnyRootConfig,
  type TRPCRateLimitOptions,
  type IStoreCallback,
} from './types'

const parseOptions = <TRoot extends AnyRootConfig, Res>(
  passed: TRPCRateLimitOptions<TRoot, Res>
) => {
  return {
    root: passed.root,
    windowMs: passed.windowMs ?? 60_000,
    max: passed.max ?? 5,
    message: passed.message ?? 'Too many requests, please try again later.',
    fingerprint: passed.fingerprint,
    onLimit: passed.onLimit,
  } as unknown as Required<TRPCRateLimitOptions<AnyRootConfig, Res>>
}

export * from './types'

export const defineTRPCLimiter = <Store extends IStoreCallback, Res>(
  adapter: ILimiterAdapter<Store, Res>
) => {
  return <TRoot extends AnyRootConfig>(
    opts: TRPCRateLimitOptions<TRoot, Res>
  ) => {
    const options = parseOptions(opts)
    const store = adapter.store(options)
    const middleware = async ({ ctx, next, input }: any) => {
      const fp = await options.fingerprint(ctx, input)
      if (!fp) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No fingerprint returned',
        })
      }
      const hitInfo = await adapter.isBlocked(store, fp, options as any)
      if (hitInfo) {
        if (typeof options.onLimit === 'function') {
          await options.onLimit(hitInfo as any, ctx, fp)
        }
        const message =
          typeof options.message === 'function'
            ? await options.message(hitInfo as any, ctx, fp)
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
