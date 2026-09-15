import { Redis } from 'ioredis'
import type { AttemptOutcome, SaleStore } from './sale-store.js'

const ATTEMPT_SCRIPT = `
if redis.call('SISMEMBER', KEYS[1], ARGV[1]) == 1 then
  return 'already_purchased'
end
local stock = tonumber(redis.call('GET', KEYS[2]))
if stock == nil or stock <= 0 then
  return 'sold_out'
end
redis.call('SADD', KEYS[1], ARGV[1])
redis.call('DECR', KEYS[2])
return 'success'
`

/**
 * Multi-process store. The Lua script runs atomically inside Redis's
 * single-threaded executor — the same check-and-decrement logic as the
 * in-memory store, safe across any number of app instances. See ADR-0005.
 */
export class RedisSaleStore implements SaleStore {
  private readonly redis: Redis
  private readonly buyersKey: string
  private readonly stockKey: string

  constructor(url: string, keyPrefix = 'flashsale') {
    this.redis = new Redis(url)
    this.buyersKey = `${keyPrefix}:buyers`
    this.stockKey = `${keyPrefix}:stock`
    this.redis.defineCommand('attemptPurchase', {
      numberOfKeys: 2,
      lua: ATTEMPT_SCRIPT,
    })
  }

  async init(stock: number): Promise<void> {
    // SET NX: a second app instance booting against the same Redis must not
    // reset an in-flight sale.
    await this.redis.set(this.stockKey, stock, 'NX')
  }

  async attemptPurchase(userId: string): Promise<AttemptOutcome> {
    const result = await (
      this.redis as unknown as {
        attemptPurchase(buyers: string, stock: string, userId: string): Promise<string>
      }
    ).attemptPurchase(this.buyersKey, this.stockKey, userId)
    return result as AttemptOutcome
  }

  async hasPurchased(userId: string): Promise<boolean> {
    return (await this.redis.sismember(this.buyersKey, userId)) === 1
  }

  async remainingStock(): Promise<number> {
    const stock = await this.redis.get(this.stockKey)
    return stock === null ? 0 : Number(stock)
  }

  async close(): Promise<void> {
    await this.redis.quit()
  }
}
