import { afterAll, describe } from 'vitest'
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

// describe.skip when REDIS_URL is unset: the suite shows as skipped rather
// than failing the file with "no test suite found".
const redisSuite = REDIS_URL ? describe : describe.skip

redisSuite('redis store', () => {
  saleStoreContract('redis', make)
  saleStoreConcurrency('redis', make)

  afterAll(async () => {
    await Promise.all(stores.map((s) => s.close()))
  })
})
