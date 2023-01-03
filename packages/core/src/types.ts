/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  type MiddlewareFunction,
  type RootConfig,
  type DefaultErrorShape,
} from '@trpc/server'

export type AnyRootConfig = {
  _config: RootConfig<{
    ctx: any
    meta: object
    errorShape: DefaultErrorShape
    transformer: any
  }>
}

export type TRPCRateLimitOptions<Req, Res, TRoot extends AnyRootConfig> = {
  /**
   * Your root tRPC object returned from `initTRPC.create()`
   * @required
   **/
  root: TRoot
  /**
   * Your context request
   * @required
   **/
  getReq: (ctx: TRoot['_config']['$types']['ctx']) => Req

  /**
   * Your context response
   * @required
   **/
  getRes: (ctx: TRoot['_config']['$types']['ctx']) => Res

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

export type ILimiterCore<Req, Res> = <TRoot extends AnyRootConfig>(
  opts: TRPCRateLimitOptions<Req, Res, TRoot>
) => MiddlewareFunction<any, any>
