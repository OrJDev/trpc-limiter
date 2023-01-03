import { initTRPC } from '@trpc/server'
import type { IContext } from './context'
import { createTRPCLimiter } from '@trpc-limiter/core'

export const root = initTRPC.context<IContext>().create()

export const router = root.router
export const procedure = root.procedure

const limiter = createTRPCLimiter({
  root,
  fingerprint: (ctx) => ctx.req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  windowMs: 20000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(limiter)
