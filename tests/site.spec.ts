import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/about', '/services', '/case-studies', '/contact', '/contact/sales', '/contact/support', '/electronic-billing', '/electronic-billing/form', '/hiring/positions', '/insights', '/privacy', '/login', '/signup']

for (const route of publicRoutes) {
  test(`${route} renders without browser errors`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`http://127.0.0.1:4173${route}`)
    await page.waitForTimeout(250)
    if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`)
    await expect(page.locator('body')).not.toBeEmpty()
    await expect(page.locator('h1, h2').first()).toBeVisible()
    expect(errors).toEqual([])
  })
}

test('mobile navigation exposes valid destinations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:4173/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(navigation.getByRole('link', { name: 'Services' })).toBeVisible()
  await navigation.getByRole('link', { name: 'Services' }).click()
  await expect(page).toHaveURL(/\/services$/)
})

test('contact form has a working success state', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/contact')
  await page.getByLabel('Full name').fill('Quality Reviewer')
  await page.getByLabel('Work email').fill('review@example.com')
  await page.getByLabel('What would you like to achieve?').fill('Validate the contact journey.')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByRole('status')).toContainText('received your message')
})

test('protected dashboard redirects to login', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/auth/dashboard')
  await expect(page).toHaveURL(/\/login$/)
})
