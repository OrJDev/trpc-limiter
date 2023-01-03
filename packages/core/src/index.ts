/* eslint-disable @typescript-eslint/no-explicit-any */
import { type MiddlewareFunction, TRPCError } from '@trpc/server'
import { MemoryStore } from './store'
import {
  type AnyRootConfig,
  type ILimiterCore,
  type TRPCRateLimitOptions,
} from './types'

const parseOptions = <TRoot extends AnyRootConfig>(
  passed: TRPCRateLimitOptions<TRoot>
): Required<TRPCRateLimitOptions<TRoot>> => {
  return {
    root: passed.root,
    windowMs: passed.windowMs ?? 60_000,
    max: passed.max ?? 5,
    message: passed.message ?? 'Too many requests, please try again later.',
    fingerprint: passed.fingerprint,
  }
}

export * from './types'
export * from './store'

export const asLimiterCore = (middleware: ILimiterCore) => {
  return middleware
}

export const createTRPCLimiter = <TRoot extends AnyRootConfig>(
  opts: TRPCRateLimitOptions<TRoot>
) => {
  const options = parseOptions(opts)
  const store = new MemoryStore(options)
  const middleware: MiddlewareFunction<any, any> = async ({ ctx, next }) => {
    const fp = await opts.fingerprint(ctx)
    if (!fp) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No fingerprint returned',
      })
    }
    const { totalHits } = await store.increment(fp)
    if (totalHits > options.max) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: opts.message,
      })
    }
    return next()
  }
  return middleware
}
