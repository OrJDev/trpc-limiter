import { defineTRPCLimiter } from '@trpc-limiter/core'
import { MemoryStore } from './store'

export const createTRPCStoreLimiter = defineTRPCLimiter({
  store: (opts) => new MemoryStore(opts),
  async isBlocked(store, fingerPrint, opts) {
    const { totalHits, resetTime } = await store.increment(fingerPrint)
    if (totalHits > opts.max) {
      return Math.ceil((resetTime.getTime() - Date.now()) / 1000)
    }
    return null
  },
})
