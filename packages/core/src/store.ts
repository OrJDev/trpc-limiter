/**
 * Inspired by
 * https://github.com/express-rate-limit/express-rate-limit/blob/master/source/memory-store.ts
 */
import type { AnyRootConfig, TRPCRateLimitOptions } from './types'

/**
 * Calculates the time when all hit counters will be reset.
 **/
const calculateNextResetTime = (windowMs: number): Date => {
  const resetTime = new Date()
  resetTime.setMilliseconds(resetTime.getMilliseconds() + windowMs)
  return resetTime
}

export class MemoryStore {
  /** The duration of time before which all hit counts are reset (in milliseconds). */
  windowMs: number

  /** The map that stores the number of hits for each client in memory. */
  hits: Record<string, number | undefined>

  /** The time at which all hit counts will be reset. */
  resetTime: Date

  /** Reference to the active timer. */
  interval: NodeJS.Timer

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: Required<TRPCRateLimitOptions<any, any, AnyRootConfig>>
  ) {
    this.windowMs = options.windowMs
    this.resetTime = calculateNextResetTime(this.windowMs)
    this.hits = {}

    // Reset hit counts for ALL clients every `windowMs` - this will also
    // re-calculate the `resetTime`
    this.interval = setInterval(async () => {
      await this.resetAll()
    }, this.windowMs)
    // Cleaning up the interval will be taken care of by the `shutdown` method.
    if (this.interval.unref) this.interval.unref()
  }

  async increment(key: string) {
    const totalHits = (this.hits[key] ?? 0) + 1
    this.hits[key] = totalHits

    return {
      totalHits,
      resetTime: this.resetTime,
    }
  }

  async decrement(key: string): Promise<void> {
    const current = this.hits[key]

    if (current) this.hits[key] = current - 1
  }

  async resetKey(key: string): Promise<void> {
    delete this.hits[key]
  }

  /** Reset everyone's hit counter. */
  async resetAll(): Promise<void> {
    this.hits = {}
    this.resetTime = calculateNextResetTime(this.windowMs)
  }

  /** Stop timers to prevent memory leaks. */
  shutdown(): void {
    clearInterval(this.interval)
  }
}
