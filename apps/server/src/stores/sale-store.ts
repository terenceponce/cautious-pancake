import type { PurchaseOutcome } from '@flashsale/api-types'

export type AttemptOutcome = Exclude<PurchaseOutcome, 'sale_not_active'>

export interface SaleStore {
  init(stock: number): Promise<void>
  attemptPurchase(userId: string): Promise<AttemptOutcome>
  hasPurchased(userId: string): Promise<boolean>
  remainingStock(): Promise<number>
  close(): Promise<void>
}
