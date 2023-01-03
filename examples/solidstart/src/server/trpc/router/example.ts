import { z } from 'zod'
import { procedure, rateLimitedProcedure, router } from '../utils'

export default router({
  hello: rateLimitedProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}`
    }),
  random: procedure
    .input(z.object({ num: z.number() }))
    .mutation(({ input }) => {
      return Math.floor(Math.random() * 100) / input.num
    }),
})
