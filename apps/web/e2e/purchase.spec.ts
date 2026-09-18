import { test, expect, type Page } from '@playwright/test'

// The suite walks a 4-unit sale from full to empty; serial keeps the math fixed.
test.describe.configure({ mode: 'serial' })

async function stockRemaining(page: Page): Promise<number> {
  const res = await page.request.get('/api/sale/status')
  return ((await res.json()) as { stockRemaining: number }).stockRemaining
}

// Signed-out purchase: Buy Now opens the login modal; signing in proceeds to buy.
async function buyAs(page: Page, email: string): Promise<void> {
  await page.goto('/')
  await page.getByRole('button', { name: 'Buy Now' }).click()
  await page.getByPlaceholder('your@email.com').fill(email)
  await page.getByRole('button', { name: 'Continue' }).click()
}

test('happy purchase: sign-in gate, feedback, stock drops, session persists', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('active')).toBeVisible()

  const before = await stockRemaining(page)
  await buyAs(page, 'alice@example.com')

  await expect(page.getByText('You secured one!')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Secured ✓' })).toBeDisabled()
  await expect(page.getByText('alice@example.com')).toBeVisible()
  await expect
    .poll(() => stockRemaining(page), { timeout: 8_000 })
    .toBe(before - 1)
})

test('repeat purchase: signed-in user buys directly, no modal', async ({ page }) => {
  await buyAs(page, 'bob@example.com')
  await expect(page.getByText('You secured one!')).toBeVisible()

  // Session survives reload — clicking Buy Now goes straight to the purchase.
  await page.goto('/')
  await page.getByRole('button', { name: 'Buy Now' }).click()
  await expect(page.getByText('You already got one.')).toBeVisible()
})

test('sign out returns to the signed-out state', async ({ page }) => {
  await buyAs(page, 'dave@example.com')
  await expect(page.getByText('You secured one!')).toBeVisible()

  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
})

test('sold out: button reflects an empty sale', async ({ page }) => {
  await buyAs(page, 'carol@example.com')
  await expect(page.getByText('You secured one!')).toBeVisible()

  await expect.poll(() => stockRemaining(page)).toBe(0)

  await page.goto('/')
  const buyButton = page.getByRole('button', { name: 'Sold out' })
  await expect(buyButton).toBeDisabled()
})
