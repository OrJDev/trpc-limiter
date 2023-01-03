import { initTRPC, TRPCError } from '@trpc/server'
import type { IContext } from './context'
import { createTRPCLimiter } from '@trpc-limiter/core'

export const root = initTRPC.context<IContext>().create()

export const router = root.router
export const procedure = root.procedure

const limiter = createTRPCLimiter({
  root,
  fingerprint: (ctx) => ctx.req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  windowMs: 20000,
  message: (hitInfo) =>
    `Too many requests, please try again later. ${hitInfo.retryAfter}`,
  max: 15,
  onLimit: (hitInfo, _ctx, fingerprint) => {
    console.log(hitInfo, fingerprint)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Too many requests unique',
    })
  },
})

export const rateLimitedProcedure = root.procedure.use(limiter)
