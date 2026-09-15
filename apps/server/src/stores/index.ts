import type { Config } from '../config.js'
import type { SaleStore } from './sale-store.js'
import { InMemorySaleStore } from './in-memory.js'
import { RedisSaleStore } from './redis.js'

export function createStore(config: Config): SaleStore {
  if (config.STORE === 'redis') {
    return new RedisSaleStore(config.REDIS_URL!)
  }
  return new InMemorySaleStore()
}
