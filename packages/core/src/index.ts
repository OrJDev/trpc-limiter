/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type MiddlewareFunction,
  type AnyRootConfig,
  TRPCError,
} from '@trpc/server'
import { MemoryStore } from './store'
import { type TRPCRateLimitOptions } from './types'

const parseOptions = <TRoot extends AnyRootConfig>(
  passed: TRPCRateLimitOptions<TRoot>
): Required<TRPCRateLimitOptions<TRoot>> => {
  return {
    root: passed.root,
    windowMs: passed.windowMs ?? 60_000,
    max: passed.max ?? 5,
    message: passed.message ?? 'Too many requests, please try again later.',
    shouldSetHeaders: true,
  }
}

export const createGetIPFunc = <Req>(func: (r?: Req) => string | undefined) => {
  return (req: Req) => {
    if (!req) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No request object: expected `req` to be defined',
      })
    }
    const ip = func(req) ?? '127.0.0.1'
    return ip
  }
}

export const createRateLimiterWrapper = <Res, TRoot extends AnyRootConfig>(
  getReqIp: (...args: any[]) => string | undefined,
  setHeader: (name: string, value: any, res: Res) => void
) => {
  return (opts: TRPCRateLimitOptions<TRoot>) => {
    const options = parseOptions(opts)
    const store = new MemoryStore(options)

    const middleware: MiddlewareFunction<any, any> = async ({ ctx, next }) => {
      const ip = getReqIp(ctx.req)
      if (!ip) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No IP found',
        })
      }
      const { totalHits, resetTime } = await store.increment(ip)
      if (totalHits > options.max) {
        const retryAfter = Math.ceil((resetTime.getTime() - Date.now()) / 1000)
        if (opts.shouldSetHeaders) {
          setHeader('Retry-After', retryAfter, ctx.res)
        }
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: opts.message,
        })
      }
      return next()
    }

    return middleware
  }
}

export const verifyIP = (ip?: string | string[] | null): string | undefined => {
  if (ip) {
    if (Array.isArray(ip)) return ip[0]
    return ip
  }
}

export * from './types'
export * from './store'
