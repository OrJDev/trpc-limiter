/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRPCError } from '@trpc/server'
import {
  type ILimiterAdapter,
  type AnyRootConfig,
  type TRPCRateLimitOptions,
  type IStoreCallback,
  MwFn,
} from './types'

const parseOptions = <TRoot extends AnyRootConfig, Res, A = null>(
  passed: TRPCRateLimitOptions<TRoot, Res>,
  getDefaultOptions?: (
    currentState: Required<TRPCRateLimitOptions<AnyRootConfig, any, A>>
  ) => Required<A>
) => {
  const b = {
    ...passed,
    windowMs: passed.windowMs ?? 60_000,
    max: passed.max ?? 5,
    message: passed.message ?? 'Too many requests, please try again later.',
    fingerprint: passed.fingerprint,
    onLimit: passed.onLimit,
  } as unknown as Required<TRPCRateLimitOptions<AnyRootConfig, Res, A>>
  const newOpts = getDefaultOptions ? getDefaultOptions(b as any) : ({} as any)
  return {
    ...b,
    ...newOpts,
  }
}

export * from './types'

export const defineTRPCLimiter = <
  Store extends IStoreCallback<A>,
  Res,
  A = null
>(
  adapter: ILimiterAdapter<Store, Res, A>,
  getDefaultOptions?: (
    currentState: Required<TRPCRateLimitOptions<AnyRootConfig, any, A>>
  ) => Required<A>
) => {
  return <TRoot extends AnyRootConfig>(
    opts: TRPCRateLimitOptions<TRoot, Res, A>
  ) => {
    const options = parseOptions(opts as any, getDefaultOptions)
    const store = adapter.store(options as any)
    const middleware: MwFn<TRoot> = async ({ ctx, next, input }) => {
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

export const defineLimiterWithProps = <
  T,
  Store extends IStoreCallback<T> = IStoreCallback<T>,
  Res = any
>(
  adapter: ILimiterAdapter<Store, Res, T>,
  getDefaultOptions: (
    currentState: Required<TRPCRateLimitOptions<AnyRootConfig, any, T>>
  ) => Required<T>
) => {
  const d = defineTRPCLimiter(adapter as any, getDefaultOptions)
  return <TRoot extends AnyRootConfig>(
    opts: TRPCRateLimitOptions<TRoot, Res, T>
  ) => {
    type D = typeof defineTRPCLimiter<Store, Res, T>
    return d(opts as any) as any as ReturnType<ReturnType<D>>
  }
}

export const defaultFingerPrint = (req: Request | Record<any, any>) => {
  const forwarded =
    req instanceof Request
      ? req.headers.get('x-forwarded-for')
      : req.headers['x-forwarded-for']
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded : forwarded[0])?.split(/, /)[0]
    : (req as any)?.socket?.remoteAddress ?? null

  return ip || '127.0.0.1'
}
