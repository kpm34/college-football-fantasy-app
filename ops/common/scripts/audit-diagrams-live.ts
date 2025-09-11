import fs from 'node:fs'
import path from 'node:path'
import playwright from 'playwright'

type LiveResult = {
  slug: string
  url: string
  ok: boolean
  hasSVG?: boolean
  errorText?: string
  durationMs: number
}

const GROUPS: Array<{ section: string; slugs: string[] }> = [
  {
    section: 'User Journeys',
    slugs: [
      'user-journeys:auth-user-flow',
      'user-journeys:auth:sign-in-up',
      'user-journeys:auth:oauth-callback',
      'user-journeys:auth:invite-join-and-draft-room',
      'user-journeys:leagues-user-flow',
      'user-journeys:draft-user-flow',
      'user-journeys:projections-user-flow',
      'user-journeys:scoring-user-flow',
      'user-journeys:realtime-user-flow',
      'user-journeys:ops-deploy-user-flow',
    ],
  },
  {
    section: 'Site Map',
    slugs: [
      'sitemap:web:active',
      'sitemap:mobile:active',
      'sitemap:web:final',
      'sitemap:mobile:final',
    ],
  },
  {
    section: 'Entity Relations',
    slugs: [
      'entity-relations:core-er',
      'entity-relations:auth-entity-relation',
      'entity-relations:leagues-entity-relation',
      'entity-relations:draft-entity-relation',
      'entity-relations:projections-entity-relation',
      'entity-relations:scoring-entity-relation',
      'entity-relations:realtime-entity-relation',
      'entity-relations:ops-deploy-entity-relation',
    ],
  },
  {
    section: 'Directory Map',
    slugs: [
      'directory-map:chapters:app',
      'directory-map:chapters:components',
      'directory-map:chapters:lib',
      'directory-map:chapters:docs',
      'directory-map:chapters:functions',
      'directory-map:chapters:schema',
      'directory-map:chapters:ops',
    ],
  },
  {
    section: 'Workflows',
    slugs: [
      'workflows:index',
<<<<<<< HEAD
      'workflows:ship-feature',
      'workflows:fix-prod-incident',
      'workflows:change-database-safely',
      'workflows:track-events-correctly',
      'workflows:design-to-code',
      'workflows:design-3d-animations',
      'workflows:launch-campaign',
=======
      'workflows:production-process',
      'workflows:incident-hotfix',
      'workflows:schema-migration',
      'workflows:analytics-instrumentation',
      'workflows:design-handoff-integration',
      'workflows:campaign-launch',
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
    ],
  },
]

async function audit(baseUrl: string) {
  const browser = await playwright.chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  const results: LiveResult[] = []

  for (const g of GROUPS) {
    for (const slug of g.slugs) {
      const url = `${baseUrl.replace(/\/$/, '')}/admin/diagrams/${encodeURIComponent(slug)}`
      const t0 = Date.now()
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })
        // Poll for either success (SVG present) or error text, up to ~6s
        let hasSVG = false
        let errorSnippet = ''
        const deadline = Date.now() + 6000
        while (Date.now() < deadline) {
          hasSVG = await page
            .evaluate(() => document.querySelectorAll('[data-mermaid] svg').length > 0)
            .catch(() => false)
          const html = await page.content()
          const errMatch =
            html.match(/Diagram failed to render[\s\S]*?(?=<\/)/i) ||
            html.match(/parse error|error:/i)
          if (hasSVG) {
            errorSnippet = ''
            break
          }
          if (errMatch) {
            errorSnippet = String(errMatch[0]).slice(0, 280)
            break
          }
          await page.waitForTimeout(250)
        }
        if (hasSVG && !errorSnippet) {
          results.push({ slug, url, ok: true, hasSVG: true, durationMs: Date.now() - t0 })
        } else {
          results.push({
            slug,
            url,
            ok: false,
            hasSVG: Boolean(hasSVG),
            errorText: errorSnippet,
            durationMs: Date.now() - t0,
          })
        }
      } catch (e: any) {
        results.push({
          slug,
          url,
          ok: false,
          hasSVG: false,
          errorText: e?.message || String(e),
          durationMs: Date.now() - t0,
        })
      }
    }
  }

  await context.close()
  await browser.close()
  return results
}

async function main() {
  const base = process.env.BASE_URL || 'https://college-football-fantasy.app'
  const results = await audit(base)
  const byOk = { ok: results.filter(r => r.ok).length, fail: results.filter(r => !r.ok).length }
  const out = { createdAt: new Date().toISOString(), base, summary: byOk, results }
  const outPath = path.join(process.cwd(), 'e2e-admin-diagrams-live-audit.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(outPath)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
