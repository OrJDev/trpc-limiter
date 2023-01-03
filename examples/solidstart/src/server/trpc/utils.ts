import { initTRPC } from '@trpc/server'
import type { IContext } from './context'
import { createTRPCSolidLimiter } from '@trpc-limiter/solid'

export const root = initTRPC.context<IContext>().create()

export const router = root.router
export const procedure = root.procedure

const limiter = createTRPCSolidLimiter({
  root,
  getReq: (ctx) => ctx.req,
  getRes: (ctx) => ctx.res,
  windowMs: 20000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

console.log(limiter)

export const rateLimitedProcedure = root.procedure.use(limiter)
