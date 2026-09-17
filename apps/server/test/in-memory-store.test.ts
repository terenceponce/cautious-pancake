import { saleStoreContract, saleStoreConcurrency } from './contract.js'
import { InMemorySaleStore } from '../src/stores/in-memory.js'

async function make(stock: number) {
  const store = new InMemorySaleStore()
  await store.init(stock)
  return store
}

saleStoreContract('in-memory', make)
saleStoreConcurrency('in-memory', make)
