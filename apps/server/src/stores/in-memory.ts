import type { AttemptOutcome, SaleStore } from './sale-store.js'

/**
 * Single-process store. The whole critical section in attemptPurchase is
 * synchronous — no await between check and mutate — so the Node event loop
 * makes it atomic. That guarantee only holds within one process; see ADR-0005.
 */
export class InMemorySaleStore implements SaleStore {
  private stock = 0
  private readonly buyers = new Set<string>()

  async init(stock: number): Promise<void> {
    this.stock = stock
    this.buyers.clear()
  }

  async attemptPurchase(userId: string): Promise<AttemptOutcome> {
    if (this.buyers.has(userId)) return 'already_purchased'
    if (this.stock <= 0) return 'sold_out'
    this.buyers.add(userId)
    this.stock--
    return 'success'
  }

  async hasPurchased(userId: string): Promise<boolean> {
    return this.buyers.has(userId)
  }

  async remainingStock(): Promise<number> {
    return this.stock
  }

  async close(): Promise<void> {}
}
