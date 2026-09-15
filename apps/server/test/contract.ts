import { describe, it, expect } from 'vitest'
import type { SaleStore } from '../src/stores/sale-store.js'

/**
 * The behavioral spec every SaleStore implementation must satisfy (ADR-0005).
 * `make(stock)` must return a fresh store seeded with the given stock.
 */
export function saleStoreContract(name: string, make: (stock: number) => Promise<SaleStore>) {
  describe(`${name} SaleStore contract`, () => {
    it('grants a purchase, records the buyer, decrements stock', async () => {
      const store = await make(100)
      expect(await store.attemptPurchase('alice')).toBe('success')
      expect(await store.hasPurchased('alice')).toBe(true)
      expect(await store.remainingStock()).toBe(99)
    })

    it('rejects a repeat purchase without touching stock', async () => {
      const store = await make(100)
      await store.attemptPurchase('alice')
      expect(await store.attemptPurchase('alice')).toBe('already_purchased')
      expect(await store.remainingStock()).toBe(99)
    })

    it('reports sold_out once stock is exhausted', async () => {
      const store = await make(1)
      expect(await store.attemptPurchase('alice')).toBe('success')
      expect(await store.attemptPurchase('bob')).toBe('sold_out')
      expect(await store.remainingStock()).toBe(0)
    })

    it('already_purchased wins over sold_out', async () => {
      const store = await make(1)
      await store.attemptPurchase('alice')
      expect(await store.attemptPurchase('alice')).toBe('already_purchased')
    })

    it('hasPurchased is false for a stranger', async () => {
      const store = await make(100)
      expect(await store.hasPurchased('stranger')).toBe(false)
    })
  })
}

export function saleStoreConcurrency(name: string, make: (stock: number) => Promise<SaleStore>) {
  describe(`${name} concurrency`, () => {
    it('sells exactly STOCK units to parallel buyers — no oversell', async () => {
      const store = await make(100)
      const users = Array.from({ length: 1000 }, (_, i) => `user-${i}`)
      const outcomes = await Promise.all(users.map((u) => store.attemptPurchase(u)))

      const count = (o: string) => outcomes.filter((x) => x === o).length
      expect(count('success')).toBe(100)
      expect(count('sold_out')).toBe(900)
      expect(await store.remainingStock()).toBe(0)
    })

    it('lets a racing user win exactly once', async () => {
      const store = await make(100)
      const results = await Promise.all(
        Array.from({ length: 50 }, () => store.attemptPurchase('racer')),
      )
      expect(results.filter((r) => r === 'success')).toHaveLength(1)
      expect(results.filter((r) => r === 'already_purchased')).toHaveLength(49)
    })
  })
}
