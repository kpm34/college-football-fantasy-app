import { expect, test } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const DEV_TOKEN = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || 'testtoken'

test.describe.configure({ timeout: 120_000 })

test.describe('Admin diagrams smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Seed dev admin token in localStorage via about:blank then navigate
    await page.goto('about:blank')
    await page.addInitScript(
      ({ token }) => {
        try {
          window.localStorage.setItem('admin-dev-token', token)
        } catch {}
      },
      { token: DEV_TOKEN }
    )

    // Prewarm heavy endpoints to avoid first-hit compile flakiness in dev
    await page.request.get(`${BASE}/api/docs/mermaid/functional-flow:create-account`)
    await page.request.get(`${BASE}/api/docs/mermaid/system-architecture:projections-overview`)
    await page.request.get(`${BASE}/api/docs/project-map-inventory`)
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
  })

  test('Open a diagram via direct slug route', async ({ page }) => {
    await page.goto(
      `${BASE}/admin/diagrams/functional-flow:create-account?devAdmin=${encodeURIComponent(DEV_TOKEN)}`,
      { waitUntil: 'commit' }
    )
    // Expect at least one mermaid container to render
    await expect(page.locator('[data-mermaid]').first()).toBeVisible({ timeout: 60000 })
  })

  test('Open a diagram via Admin Quick Open event', async ({ page }) => {
    await page.goto(`${BASE}/admin?devAdmin=${encodeURIComponent(DEV_TOKEN)}`, {
      waitUntil: 'commit',
    })
    // Ensure event bridge exists
    await page.waitForFunction(() => Boolean((window as any)._openDiagramHandler), undefined, {
      timeout: 60000,
    })
    // Dispatch the open event
    await page.evaluate(() => {
      window.dispatchEvent(
        new CustomEvent('admin-open-diagram', {
          detail: { open: 'functional-flow:create-account', title: 'Create Account' },
        })
      )
    })
    await expect(page.locator('[data-mermaid]').first()).toBeVisible({ timeout: 60000 })
  })
})
