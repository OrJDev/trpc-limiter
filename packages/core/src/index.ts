/* eslint-disable @typescript-eslint/no-explicit-any */
import { type MiddlewareFunction, TRPCError } from '@trpc/server'
import { MemoryStore } from './store'
import {
  type AnyRootConfig,
  type ILimiterCore,
  type TRPCRateLimitOptions,
} from './types'

const parseOptions = <Req, Res, TRoot extends AnyRootConfig>(
  passed: TRPCRateLimitOptions<Req, Res, TRoot>
): Required<TRPCRateLimitOptions<Req, Res, TRoot>> => {
  return {
    root: passed.root,
    windowMs: passed.windowMs ?? 60_000,
    max: passed.max ?? 5,
    message: passed.message ?? 'Too many requests, please try again later.',
    shouldSetHeaders: true,
    getReq: passed.getReq,
    getRes: passed.getRes,
  }
}

const getReqIp = <Req>(
  func: (r?: Req) => string | null | string[] | undefined,
  req: Req
) => {
  const ip = func(req) ?? '127.0.0.1'
  if (Array.isArray(ip)) return ip[0]
  return ip
}

export * from './types'
export * from './store'

export const asLimiterCore = <Req, Res>(middleware: ILimiterCore<Req, Res>) => {
  return middleware
}

export const defineTRPCLimiter = <Req, Res>(
  func: (r?: Req) => string | null | string[] | undefined,
  setHeader: (name: string, value: any, res: Res) => void
) => {
  return <TRoot extends AnyRootConfig>(
    opts: TRPCRateLimitOptions<Req, Res, TRoot>
  ) => {
    const options = parseOptions(opts)
    const store = new MemoryStore(options)
    const middleware: MiddlewareFunction<any, any> = async ({ ctx, next }) => {
      const ip = getReqIp(func, opts.getReq(ctx))
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
          const res = opts.getRes(ctx.res)
          setHeader('Retry-After', retryAfter, res)
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
