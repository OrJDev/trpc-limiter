/* eslint-disable @typescript-eslint/no-explicit-any */
import { type MiddlewareFunction, type AnyRootConfig } from '@trpc/server'

// export type IExpectedRootConfig = ReturnType<typeof initTRPC["create"]>;
export type TRPCRateLimitOptions<TRoot extends AnyRootConfig> = {
  /**
   * Your root tRPC object returned from `initTRPC.create()`
   * @required
   **/
  root: TRoot

  /**
   * Time frame in milliseconds how long to keep track of requests
   * @default 60000 (1 minute)
   */
  windowMs?: number

  /**
   * The number of requests allowed per `windowMs`.
   * @default 5
   **/
  max?: number | ((ctx: unknown) => number)

  /**
   * The response body to send when a request is blocked.
   * @default 'Too many requests, please try again later.'
   **/
  message?: string

  /**
   * Wheter or not some headers should be set.
   * @default true
   */
  shouldSetHeaders?: boolean
}

export type ILimiterCore = <TRoot extends AnyRootConfig>(
  opts: TRPCRateLimitOptions<TRoot>
) => MiddlewareFunction<any, any>
