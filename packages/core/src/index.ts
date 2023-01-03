/* eslint-disable @typescript-eslint/no-explicit-any */
import { type MiddlewareFunction, TRPCError } from '@trpc/server'
import { MemoryStore } from './store'
import { type AnyRootConfig, type TRPCRateLimitOptions } from './types'

const parseOptions = <TRoot extends AnyRootConfig>(
  passed: TRPCRateLimitOptions<TRoot>
) => {
  return {
    root: passed.root,
    windowMs: passed.windowMs ?? 60_000,
    max: passed.max ?? 5,
    message: passed.message ?? 'Too many requests, please try again later.',
    fingerprint: passed.fingerprint,
    onLimit: passed.onLimit,
  } as unknown as Required<TRPCRateLimitOptions<AnyRootConfig>>
}

export * from './types'
export * from './store'

export const createTRPCLimiter = <TRoot extends AnyRootConfig>(
  opts: TRPCRateLimitOptions<TRoot>
) => {
  const options = parseOptions(opts)
  const store = new MemoryStore(options)
  const middleware: MiddlewareFunction<any, any> = async ({ ctx, next }) => {
    const fp = await options.fingerprint(ctx)
    if (!fp) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No fingerprint returned',
      })
    }
    const { totalHits, resetTime } = await store.increment(fp)
    if (totalHits > options.max) {
      const hitInfo = {
        retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
        totalHits,
      }

      if (typeof options.onLimit === 'function') {
        await options.onLimit(hitInfo, ctx, fp)
      }

      const message =
        typeof options.message === 'function'
          ? await options.message(hitInfo, ctx, fp)
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
