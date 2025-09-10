import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:3001'
const DEV_TOKEN = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || 'testtoken'

type DiagramResult = {
  section: string
  title?: string
  slug?: string
  url: string
  ok: boolean
  hasMermaid?: boolean
  fallbackMarkdown?: boolean
  statusText?: string
}

test.describe.configure({ timeout: 180_000 })

test('Admin buttons and diagrams audit', async ({ page, context }) => {
  const results: DiagramResult[] = []

  // Seed dev admin token
  await page.goto('about:blank')
  await page.addInitScript(
    ({ token }) => {
      try {
        window.localStorage.setItem('admin-dev-token', token)
      } catch {}
    },
    { token: DEV_TOKEN }
  )

  // Go to admin dashboard
  await page.goto(`${BASE}/admin?devAdmin=${encodeURIComponent(DEV_TOKEN)}`, {
    waitUntil: 'domcontentloaded',
  })
  await expect(page.getByText('Admin Dashboard')).toBeVisible()

  // 1) Quick Open flow
  const input = page.locator('input[placeholder^="Open by slug"]')
  await input.fill('user-journeys:create-account')
  await Promise.all([
    page.waitForSelector('[data-mermaid]', { timeout: 60_000 }),
    page.getByRole('button', { name: 'Open' }).click(),
  ])
  {
    const hasMermaid = await page.locator('[data-mermaid]').first().isVisible()
    results.push({
      section: 'Admin Quick Open',
      title: 'user-journeys:create-account',
      url: `${BASE}/admin?open=user-journeys:create-account`,
      ok: hasMermaid,
      hasMermaid,
    })
  }
  // Close modal
  await page.locator('button:has-text("×")').click()

  // Helper: visit a page and collect all slugs beginning with /admin/diagrams/
  async function auditSlugList(indexUrl: string, section: string) {
    await page.goto(`${BASE}${indexUrl}?devAdmin=${encodeURIComponent(DEV_TOKEN)}`, {
      waitUntil: 'domcontentloaded',
    })
    const anchors = page.locator('a[href^="/admin/diagrams/"]')
    const count = await anchors.count()
    for (let i = 0; i < count; i++) {
      const a = anchors.nth(i)
      const href = await a.getAttribute('href')
      const title = await a.textContent()
      if (!href) continue
      const [nav] = await Promise.all([page.waitForNavigation(), a.click()])
      const url = page.url()
      // Consider diagram rendered if any [data-mermaid] exists
      const hasMermaid = await page.locator('[data-mermaid]').first().isVisible().catch(() => false)
      // Fallback markdown indicator
      const hasPre = await page.locator('article pre.whitespace-pre-wrap').first().isVisible().catch(() => false)
      results.push({
        section,
        title: (title || '').trim(),
        slug: decodeURIComponent(url.split('/admin/diagrams/')[1] || ''),
        url,
        ok: hasMermaid || hasPre,
        hasMermaid,
        fallbackMarkdown: hasPre && !hasMermaid,
        statusText: String(nav?.status?.()) || undefined,
      })
      await page.goBack()
    }
  }

  // 2) User Journeys
  await auditSlugList('/admin/diagrams/user-journeys', 'User Journeys')

  // 3) Site Map
  await auditSlugList('/admin/diagrams/site-map', 'Site Map')

  // 4) Draft
  await auditSlugList('/admin/diagrams/draft', 'Draft')

  // 5) Entity Relations (Mermaid and Draw.io buttons). Audit Mermaid links here.
  await page.goto(`${BASE}/admin/diagrams/entity-relations?devAdmin=${encodeURIComponent(DEV_TOKEN)}`)
  const erMermaidLinks = page.locator('a[href^="/admin/diagrams/"]:not([href^="/admin/diagrams/viewer/"])')
  const erCount = await erMermaidLinks.count()
  for (let i = 0; i < erCount; i++) {
    const a = erMermaidLinks.nth(i)
    const href = await a.getAttribute('href')
    const title = await a.textContent()
    if (!href) continue
    const [nav] = await Promise.all([page.waitForNavigation(), a.click()])
    const url = page.url()
    const hasMermaid = await page.locator('[data-mermaid]').first().isVisible().catch(() => false)
    const hasPre = await page.locator('article pre.whitespace-pre-wrap').first().isVisible().catch(() => false)
    results.push({
      section: 'Entity Relations',
      title: (title || '').trim(),
      slug: decodeURIComponent(url.split('/admin/diagrams/')[1] || ''),
      url,
      ok: hasMermaid || hasPre,
      hasMermaid,
      fallbackMarkdown: hasPre && !hasMermaid,
      statusText: String(nav?.status?.()) || undefined,
    })
    await page.goBack()
  }

  // Also check if Draw.io viewer route exists (expected missing)
  const drawioLinks = page.locator('a[href^="/admin/diagrams/viewer/"]')
  const dCount = await drawioLinks.count()
  for (let i = 0; i < dCount; i++) {
    const a = drawioLinks.nth(i)
    const href = await a.getAttribute('href')
    if (!href) continue
    const p = await context.newPage()
    const resp = await p.goto(`${BASE}${href}`)
    results.push({
      section: 'Entity Relations (Draw.io viewer)',
      url: `${BASE}${href}`,
      ok: Boolean(resp && resp.status() === 200),
      statusText: String(resp?.status() || 'NA'),
    })
    await p.close()
  }

  // 6) Directory Map chapters — click each chapter button and verify at least one diagram renders
  await page.goto(`${BASE}/admin/directory-map?devAdmin=${encodeURIComponent(DEV_TOKEN)}`)
  const chapterButtons = page.locator('nav ul li button')
  const chCount = await chapterButtons.count()
  for (let i = 0; i < chCount; i++) {
    const btn = chapterButtons.nth(i)
    const title = await btn.textContent()
    await btn.click()
    // Diagrams section renders below; give a moment
    const hasMermaid = await page
      .locator('section:has(h3:text("Diagrams")) [data-mermaid]')
      .first()
      .isVisible()
      .catch(() => false)
    results.push({
      section: 'Directory Map',
      title: (title || '').trim(),
      url: page.url(),
      ok: hasMermaid,
      hasMermaid,
    })
  }

  // 7) Product Vision page loads and Expand/Collapse controls work (not a diagram)
  await page.goto(`${BASE}/admin/product-vision?devAdmin=${encodeURIComponent(DEV_TOKEN)}`)
  const expandBtn = page.getByRole('button', { name: 'Expand all' })
  const collapseBtn = page.getByRole('button', { name: 'Collapse all' })
  const controlsOk = (await expandBtn.isVisible().catch(() => false)) && (await collapseBtn.isVisible().catch(() => false))
  results.push({ section: 'Product Vision', url: page.url(), ok: controlsOk })

  // Write report
  const outPath = 'e2e-admin-diagrams-audit.json'
  fs.writeFileSync(outPath, JSON.stringify({ createdAt: new Date().toISOString(), results }, null, 2))

  // Expect at least one diagram success
  expect(results.some(r => r.hasMermaid)).toBeTruthy()
})


