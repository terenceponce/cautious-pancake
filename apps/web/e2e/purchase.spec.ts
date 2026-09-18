import { test, expect, type Page } from '@playwright/test'

// The suite walks a 3-unit sale from full to empty; serial keeps the math fixed.
test.describe.configure({ mode: 'serial' })

async function stockRemaining(page: Page): Promise<number> {
  const res = await page.request.get('/api/sale/status')
  return ((await res.json()) as { stockRemaining: number }).stockRemaining
}

async function buyAs(page: Page, userId: string): Promise<void> {
  await page.goto('/')
  await page.getByPlaceholder('your@email.com').fill(userId)
  await page.getByRole('button', { name: 'Buy Now' }).click()
}

test('happy purchase: feedback shown, stock visibly drops', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('active')).toBeVisible()

  const before = await stockRemaining(page)
  await page.getByPlaceholder('your@email.com').fill('alice@example.com')
  await page.getByRole('button', { name: 'Buy Now' }).click()

  await expect(page.getByText('You secured one!')).toBeVisible()
  await expect
    .poll(() => stockRemaining(page), { timeout: 8_000 })
    .toBe(before - 1)
})

test('repeat purchase gets already-purchased feedback', async ({ page }) => {
  await buyAs(page, 'bob@example.com')
  await expect(page.getByText('You secured one!')).toBeVisible()

  // Fresh page state, same user — the server remembers.
  await buyAs(page, 'bob@example.com')
  await expect(page.getByText('You already got one.')).toBeVisible()
})

test('sold out: button reflects an empty sale', async ({ page }) => {
  await buyAs(page, 'carol@example.com')
  await expect(page.getByText('You secured one!')).toBeVisible()

  await expect.poll(() => stockRemaining(page)).toBe(0)

  await page.goto('/')
  const buyButton = page.getByRole('button')
  await expect(buyButton).toHaveText('Sold out')
  await expect(buyButton).toBeDisabled()
})
