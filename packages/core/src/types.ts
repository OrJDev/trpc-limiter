/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AnyRootConfig as IAnyRootConfig } from '@trpc/server'

export type AnyRootConfig = {
  _config: IAnyRootConfig
}

export type TRPCRateLimitOptions<TRoot extends AnyRootConfig, RType> = {
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
  max?: number

  /**
   * The response body to send when a request is blocked.
   * @default 'Too many requests, please try again later.'
   **/
  message?: string | ILimiterCallback<TRoot, RType, string>

  /**
   * This will be called when a request is blocked.
   **/
  onLimit?: ILimiterCallback<TRoot, RType, void>

  /**
   * Function to generate a fingerprint for a request based on tRPC context.
   * @required
   **/
  fingerprint: (
    ctx: TRoot['_config']['$types']['ctx']
  ) => string | Promise<string>
}

export type ILimiterinfo = number
export type ILimiterCallback<TRoot extends AnyRootConfig, RType, T> = (
  info: RType,
  ctx: TRoot['_config']['$types']['ctx'],
  fingerprint: string
) => T | Promise<T>

export type ILimiterAdapter<
  RType,
  Store extends (
    opts: Required<TRPCRateLimitOptions<AnyRootConfig, RType>>,
    ctx: any
  ) => any
> = {
  store: Store
  isBlocked: (
    store: ReturnType<Store>,
    fingerprint: string,
    opts: Required<TRPCRateLimitOptions<AnyRootConfig, RType>>
  ) => Promise<RType | null> | RType | null
}
