import { afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { saleStoreContract, saleStoreConcurrency } from './contract.js'
import { RedisSaleStore } from '../src/stores/redis.js'

const REDIS_URL = process.env.REDIS_URL

// Each store gets a unique key prefix so tests are isolated and parallel-safe.
const stores: RedisSaleStore[] = []

async function make(stock: number) {
  const store = new RedisSaleStore(REDIS_URL!, `test-${randomUUID()}`)
  stores.push(store)
  await store.init(stock)
  return store
}

if (REDIS_URL) {
  saleStoreContract('redis', make)
  saleStoreConcurrency('redis', make)

  afterAll(async () => {
    await Promise.all(stores.map((s) => s.close()))
  })
} else {
  console.warn('REDIS_URL not set — skipping Redis contract tests')
}
