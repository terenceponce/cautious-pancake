import { describe, it, expect } from 'vitest'
import { buildApp } from '../src/app.js'
import { loadConfig } from '../src/config.js'
import { InMemorySaleStore } from '../src/stores/in-memory.js'

type Window = 'upcoming' | 'active' | 'ended'

async function appIn(window: Window, stock = 1) {
  const now = Date.now()
  const windows: Record<Window, { start: number; end: number }> = {
    upcoming: { start: now + 60_000, end: now + 120_000 },
    active: { start: now - 60_000, end: now + 60_000 },
    ended: { start: now - 120_000, end: now - 60_000 },
  }
  const w = windows[window]
  const config = loadConfig({
    SALE_START: new Date(w.start).toISOString(),
    SALE_END: new Date(w.end).toISOString(),
    STOCK: String(stock),
  })
  const store = new InMemorySaleStore()
  await store.init(stock)
  return buildApp({ config, store })
}

const buy = (app: Awaited<ReturnType<typeof buildApp>>, userId: string) =>
  app.inject({ method: 'POST', url: '/api/purchase', payload: { userId } })

describe('POST /api/purchase', () => {
  it('succeeds, then reports already_purchased on retry', async () => {
    const app = await appIn('active')
    const first = await buy(app, 'alice')
    expect(first.statusCode).toBe(200)
    expect(first.json()).toEqual({ outcome: 'success' })

    const second = await buy(app, 'alice')
    expect(second.statusCode).toBe(409)
    expect(second.json()).toEqual({ outcome: 'already_purchased' })
  })

  it('reports sold_out with 410 once stock is gone', async () => {
    const app = await appIn('active', 1)
    await buy(app, 'alice')
    const res = await buy(app, 'bob')
    expect(res.statusCode).toBe(410)
    expect(res.json()).toEqual({ outcome: 'sold_out' })
  })

  it('rejects purchases outside the window with 403', async () => {
    for (const window of ['upcoming', 'ended'] as const) {
      const app = await appIn(window)
      const res = await buy(app, 'alice')
      expect(res.statusCode).toBe(403)
      expect(res.json()).toEqual({ outcome: 'sale_not_active' })
    }
  })

  it('rejects an invalid body with 400, strips unknown fields', async () => {
    const app = await appIn('active')
    expect((await buy(app, '')).statusCode).toBe(400)
    expect(
      (
        await app.inject({ method: 'POST', url: '/api/purchase', payload: { extra: true } })
      ).statusCode,
    ).toBe(400)
    const stripped = await app.inject({
      method: 'POST',
      url: '/api/purchase',
      payload: { userId: 'alice', extra: true },
    })
    expect(stripped.statusCode).toBe(200)
    expect(stripped.json()).toEqual({ outcome: 'success' })
  })
})

describe('GET /api/purchase/:userId', () => {
  it('answers 200 with purchased true/false either way', async () => {
    const app = await appIn('active')
    await buy(app, 'alice')

    const yes = await app.inject({ method: 'GET', url: '/api/purchase/alice' })
    expect(yes.statusCode).toBe(200)
    expect(yes.json()).toEqual({ purchased: true })

    const no = await app.inject({ method: 'GET', url: '/api/purchase/bob' })
    expect(no.statusCode).toBe(200)
    expect(no.json()).toEqual({ purchased: false })
  })
})
