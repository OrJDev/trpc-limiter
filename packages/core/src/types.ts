/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type MiddlewareFunction,
  type AnyRootConfig as IAnyRootConfig,
} from '@trpc/server'

export type AnyRootConfig = {
  _config: IAnyRootConfig
}

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
   * Function to generate a fingerprint for a request based on tRPC context.
   * @required
   **/
  fingerprint: (
    ctx: TRoot['_config']['$types']['ctx']
  ) => string | Promise<string>
}

export type ILimiterCore = <TRoot extends AnyRootConfig>(
  opts: TRPCRateLimitOptions<TRoot>
) => MiddlewareFunction<any, any>
