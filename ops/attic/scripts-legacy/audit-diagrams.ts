import fs from 'node:fs'
import path from 'node:path'

type Item = {
  section: string
  title: string
  slug: string
  file?: string
  exists: boolean
  mermaidBlocks: number
}

const ROOT = process.cwd()
const DOCS = path.join(ROOT, 'docs')

function mdHasMermaidBlocks(filePath: string): { exists: boolean; blocks: number } {
  try {
    const full = path.join(DOCS, filePath)
    if (!fs.existsSync(full)) return { exists: false, blocks: 0 }
    const content = fs.readFileSync(full, 'utf-8')
    const matches = content.match(/```mermaid\s*\n[\s\S]*?\n```/g) || []
    return { exists: true, blocks: matches.length }
  } catch {
    return { exists: false, blocks: 0 }
  }
}

function mapSlugToFile(slug: string): string | undefined {
  // Mirror the mapping logic in app/api/docs/mermaid/[slug]/route.ts for core namespaces
  if (slug.startsWith('user-journeys:')) {
    const parts = slug.split(':').slice(1)
    // Handle special auth:* slugs that are flattened in this repo (auth-<name>.md)
    if (parts[0] === 'auth') {
      const flat = `diagrams/user-journeys/auth-${parts.slice(1).join('-')}.md`
      const flatFull = path.join(DOCS, flat)
      if (fs.existsSync(flatFull)) return flat
    }
    const rel = parts.join('/') + '.md'
    return `diagrams/user-journeys/${rel}`
  }
  if (slug.startsWith('sitemap:')) {
    const rel = 'sitemap-' + slug.split(':').slice(1).join('-') + '.md'
    return `diagrams/site map/${rel}`
  }
  if (slug.startsWith('draft:')) {
    const rel = slug.split(':').slice(1).join('/') + '.md'
    return `diagrams/draft/${rel}`
  }
  if (slug.startsWith('entity-relations:')) {
    const rel = slug.split(':').slice(1).join('/') + '.md'
    return `diagrams/entity-relations/${rel}`
  }
  if (slug.startsWith('directory-map:chapters:')) {
    const rel = slug.split(':').slice(2).join('/') + '.md'
    return `diagrams/directory-map/chapters/${rel}`
  }
  return undefined
}

async function main() {
  const items: Array<{ section: string; title: string; slugs: string[] }> = [
    {
      section: 'User Journeys',
      title: 'user-journeys list',
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
      title: 'site map list',
      slugs: [
        'sitemap:web:active',
        'sitemap:mobile:active',
        'sitemap:web:final',
        'sitemap:mobile:final',
      ],
    },
    {
      section: 'Draft',
      title: 'draft list',
      slugs: [
        'draft:user-flow:draft-room-entry',
        'draft:user-flow:league-creation-flow',
        'draft:user-flow:league-joining-flow',
        'draft:user-flow:mobile-draft-experience',
        'draft:user-flow:player-selection-flow',
        'draft:entity-relation:core-draft-entities',
        'draft:entity-relation:league-team-entities',
        'draft:entity-relation:player-roster-entities',
        'draft:api-routing:backend-apis',
        'draft:api-routing:frontend-apis',
        'draft:api-routing:external-apis',
        'draft:data-flow:draft-state-management',
        'draft:data-flow:external-data-sources',
        'draft:data-flow:projection-calculation',
        'draft:data-flow:real-time-updates',
      ],
    },
    {
      section: 'Entity Relations',
      title: 'entity relations list',
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
      title: 'directory chapters',
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
  ]

  const results: Item[] = []
  for (const group of items) {
    for (const slug of group.slugs) {
      const file = mapSlugToFile(slug)
      if (!file) {
        results.push({
          section: group.section,
          title: group.title,
          slug,
          file: undefined,
          exists: false,
          mermaidBlocks: 0,
        })
        continue
      }
      const { exists, blocks } = mdHasMermaidBlocks(file)
      results.push({
        section: group.section,
        title: group.title,
        slug,
        file,
        exists,
        mermaidBlocks: blocks,
      })
    }
  }

  // Summaries per section
  const summary: Record<string, { total: number; renderable: number; missing: number }> = {}
  for (const r of results) {
    const s = (summary[r.section] ||= { total: 0, renderable: 0, missing: 0 })
    s.total += 1
    if (r.exists && r.mermaidBlocks > 0) s.renderable += 1
    else s.missing += 1
  }

  const out = {
    createdAt: new Date().toISOString(),
    root: ROOT,
    results,
    summary,
    note: 'Renderable = markdown file exists and contains at least one ```mermaid``` block. This predicts diagram visibility without launching a browser.',
  }
  const outPath = path.join(ROOT, 'e2e-admin-diagrams-static-audit.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(outPath)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
