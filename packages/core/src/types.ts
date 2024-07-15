/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AnyRootTypes,
  MiddlewareFunction,
  RootConfig,
} from '@trpc/server/unstable-core-do-not-import'

export type AnyRootConfig = {
  _config: RootConfig<AnyRootTypes>
}

export type BaseOpts<TRoot extends AnyRootConfig, Res> = {
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
  message?: string | ILimiterCallback<TRoot, Res>

  /**
   * This will be called when a request is blocked.
   **/
  onLimit?: ILimiterCallback<TRoot, Res, void>

  /**
   * Function to generate a fingerprint for a request based on tRPC context.
   * @required
   **/
  fingerprint: (
    ctx: TRoot['_config']['$types']['ctx'],
    input: any,
    path: string
  ) => string | Promise<string>
}

export type TRPCRateLimitOptions<
  TRoot extends AnyRootConfig,
  Res,
  A = null
> = A extends null ? BaseOpts<TRoot, Res> : A & BaseOpts<TRoot, Res>

export type ILimiterCallback<TRoot extends AnyRootConfig, Res, T = string> = (
  info: Res,
  ctx: TRoot['_config']['$types']['ctx'],
  fingerprint: string
) => T | Promise<T>

export type ILimiterAdapter<Store extends IStoreCallback<A>, Res, A = null> = {
  store: Store
  isBlocked: (
    store: ReturnType<Store>,
    fingerprint: string,
    opts: Required<TRPCRateLimitOptions<AnyRootConfig, Store>>
  ) => Promise<InferResCallback<Res> | null> | InferResCallback<Res> | null
}

export type InferResCallback<Res> = NonNullable<
  Res extends Promise<infer R2> ? R2 : Res
>

export type IStoreCallback<A = null> = (
  opts: Required<TRPCRateLimitOptions<AnyRootConfig, any, A>>
) => any

export type MwFn<TRoot extends AnyRootConfig> = MiddlewareFunction<
  TRoot['_config']['$types']['ctx'],
  TRoot['_config']['$types']['meta'],
  TRoot['_config']['$types']['ctx'],
  TRoot['_config']['$types']['ctx'],
  unknown
>
