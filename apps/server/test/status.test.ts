import { describe, it, expect } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import type { SaleStatusResponse } from '@flashsale/api-types'

function envFor(offsetMs: { start: number; end: number }) {
  return {
    SALE_START: new Date(Date.now() + offsetMs.start).toISOString(),
    SALE_END: new Date(Date.now() + offsetMs.end).toISOString(),
    STOCK: '100',
  }
}

describe('GET /api/sale/status', () => {
  it('reports active inside the window', async () => {
    const now = Date.now()
    const env = {
      SALE_START: new Date(now - 60_000).toISOString(),
      SALE_END: new Date(now + 60_000).toISOString(),
      STOCK: '100',
    }
    const app = buildApp(loadConfig(env))
    const res = await app.inject({ method: 'GET', url: '/api/sale/status' })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toEqual<SaleStatusResponse>({
      status: 'active',
      startsAt: env.SALE_START,
      endsAt: env.SALE_END,
      stockRemaining: 100,
    })
  })

  it('reports upcoming before the window', async () => {
    const app = buildApp(loadConfig(envFor({ start: 60_000, end: 120_000 })))
    const res = await app.inject({ method: 'GET', url: '/api/sale/status' })
    expect(res.json<SaleStatusResponse>().status).toBe('upcoming')
  })

  it('reports ended after the window', async () => {
    const app = buildApp(loadConfig(envFor({ start: -120_000, end: -60_000 })))
    const res = await app.inject({ method: 'GET', url: '/api/sale/status' })
    expect(res.json<SaleStatusResponse>().status).toBe('ended')
  })
})

describe('health endpoints', () => {
  it('answers health and ready', async () => {
    const app = buildApp(loadConfig(envFor({ start: -60_000, end: 60_000 })))
    expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200)
    expect((await app.inject({ method: 'GET', url: '/ready' })).statusCode).toBe(200)
  })
})
