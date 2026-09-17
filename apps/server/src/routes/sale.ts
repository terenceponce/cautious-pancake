import type { FastifyPluginAsync } from 'fastify'
import type { Config } from '../config.js'
import type { SaleStore } from '../stores/sale-store.js'
import type { SaleStatus, SaleStatusResponse, PurchaseResponse, PurchaseCheckResponse } from '@flashsale/api-types'

export function saleStatusAt(config: Config, now: number): SaleStatus {
  if (now < config.SALE_START.getTime()) return 'upcoming'
  if (now > config.SALE_END.getTime()) return 'ended'
  return 'active'
}

export interface SalePluginOptions {
  config: Config
  store: SaleStore
}

const OUTCOME_CODE: Record<string, number> = {
  success: 200,
  already_purchased: 409,
  sold_out: 410,
  sale_not_active: 403,
}

export const saleRoutes: FastifyPluginAsync<SalePluginOptions> = async (
  app,
  options,
) => {
  app.get('/sale/status', async (): Promise<SaleStatusResponse> => ({
    status: saleStatusAt(options.config, Date.now()),
    startsAt: options.config.SALE_START.toISOString(),
    endsAt: options.config.SALE_END.toISOString(),
    stockRemaining: await options.store.remainingStock(),
  }))

  app.post<{ Body: { userId: string } }>(
    '/purchase',
    {
      schema: {
        body: {
          type: 'object',
          required: ['userId'],
          properties: { userId: { type: 'string', minLength: 1, maxLength: 200 } },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      // Window check first — cheap clock read, no store round-trip (ADR-0011).
      if (saleStatusAt(options.config, Date.now()) !== 'active') {
        return await reply.code(403).send({ outcome: 'sale_not_active' } satisfies PurchaseResponse)
      }

      const outcome = await options.store.attemptPurchase(request.body.userId)
      return await reply
        .code(OUTCOME_CODE[outcome] ?? 500)
        .send({ outcome } satisfies PurchaseResponse)
    },
  )

  app.get<{ Params: { userId: string } }>(
    '/purchase/:userId',
    async (request): Promise<PurchaseCheckResponse> => ({
      purchased: await options.store.hasPurchased(request.params.userId),
    }),
  )
}
