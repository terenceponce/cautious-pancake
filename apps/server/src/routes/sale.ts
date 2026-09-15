import type { FastifyPluginAsync } from 'fastify'
import type { Config } from '../config.js'
import type { SaleStatus, SaleStatusResponse } from '@flashsale/api-types'

export function saleStatusAt(config: Config, now: number): SaleStatus {
  if (now < config.SALE_START.getTime()) return 'upcoming'
  if (now > config.SALE_END.getTime()) return 'ended'
  return 'active'
}

export interface SalePluginOptions {
  config: Config
}

export const saleRoutes: FastifyPluginAsync<SalePluginOptions> = async (
  app,
  options,
) => {
  app.get('/sale/status', async (): Promise<SaleStatusResponse> => ({
    status: saleStatusAt(options.config, Date.now()),
    startsAt: options.config.SALE_START.toISOString(),
    endsAt: options.config.SALE_END.toISOString(),
    stockRemaining: options.config.STOCK, // no purchase path yet; remaining == configured stock until the store lands
  }))
}
