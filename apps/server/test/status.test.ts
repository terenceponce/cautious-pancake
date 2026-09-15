import { describe, it, expect } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import { InMemorySaleStore } from '../src/stores/in-memory.js'
import type { SaleStatusResponse } from '@flashsale/api-types'

function envFor(offsetMs: { start: number; end: number }) {
  return {
    SALE_START: new Date(Date.now() + offsetMs.start).toISOString(),
    SALE_END: new Date(Date.now() + offsetMs.end).toISOString(),
    STOCK: '100',
  }
}

async function appFor(offsets: { start: number; end: number }, stock = 100) {
  const config = loadConfig(envFor(offsets))
  const store = new InMemorySaleStore()
  await store.init(stock)
  return buildApp({ config, store })
}

describe('GET /api/sale/status', () => {
  it('reports active with remaining stock inside the window', async () => {
    const now = Date.now()
    const app = await appFor({ start: -60_000, end: 60_000 })
    const res = await app.inject({ method: 'GET', url: '/api/sale/status' })
    expect(res.statusCode).toBe(200)
    expect(res.json<SaleStatusResponse>().status).toBe('active')
    expect(res.json<SaleStatusResponse>().stockRemaining).toBe(100)
    expect(new Date(res.json<SaleStatusResponse>().startsAt).getTime()).toBeGreaterThan(now - 61_000)
  })

  it('reports upcoming before the window', async () => {
    const app = await appFor({ start: 60_000, end: 120_000 })
    const res = await app.inject({ method: 'GET', url: '/api/sale/status' })
    expect(res.json<SaleStatusResponse>().status).toBe('upcoming')
  })

  it('reports ended after the window', async () => {
    const app = await appFor({ start: -120_000, end: -60_000 })
    const res = await app.inject({ method: 'GET', url: '/api/sale/status' })
    expect(res.json<SaleStatusResponse>().status).toBe('ended')
  })

  it('reflects purchases in stockRemaining', async () => {
    const app = await appFor({ start: -60_000, end: 60_000 }, 10)
    await app.inject({ method: 'POST', url: '/api/purchase', payload: { userId: 'alice' } })
    const res = await app.inject({ method: 'GET', url: '/api/sale/status' })
    expect(res.json<SaleStatusResponse>().stockRemaining).toBe(9)
  })
})

describe('health endpoints', () => {
  it('answers health and ready', async () => {
    const app = await appFor({ start: -60_000, end: 60_000 })
    expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200)
    expect((await app.inject({ method: 'GET', url: '/ready' })).statusCode).toBe(200)
  })
})
