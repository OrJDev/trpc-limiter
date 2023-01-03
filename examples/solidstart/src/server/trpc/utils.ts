import { initTRPC } from '@trpc/server'
import type { IContext } from './context'
import { createTRPCSolidLimiter } from '@trpc-limiter/solid'

export const root = initTRPC.context<IContext>().create()

export const router = root.router
export const procedure = root.procedure

const limiter = createTRPCSolidLimiter({
  // @ts-expect-error something is wrong with the types when using custom data, like context.
  root,
  windowMs: 10000,
  message: 'Too many requests, please try again later.',
  max: 15,
})

export const rateLimitedProcedure = root.procedure.use(limiter)
