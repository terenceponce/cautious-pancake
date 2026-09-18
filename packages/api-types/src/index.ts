export type SaleStatus = 'upcoming' | 'active' | 'ended'

export interface SaleStatusResponse {
  status: SaleStatus
  startsAt: string
  endsAt: string
  stockRemaining: number
  stockTotal: number
}

export type PurchaseOutcome =
  | 'success'
  | 'already_purchased'
  | 'sold_out'
  | 'sale_not_active'

export interface PurchaseRequest {
  userId: string
}

export interface PurchaseResponse {
  outcome: PurchaseOutcome
}

export interface PurchaseCheckResponse {
  purchased: boolean
}
