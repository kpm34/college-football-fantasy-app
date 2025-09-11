import { DATABASE_ID, isServerConfigured, serverDatabases } from '@/lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'

function extractMermaidBlocks(markdown: string): string[] {
  // More permissive regex: allow optional trailing spaces after language
  // and do not require a newline before the closing backticks
  const mermaidRegex = /```mermaid[^\n]*\n([\s\S]*?)```/g
  const blocks: string[] = []

  let match
  while ((match = mermaidRegex.exec(markdown)) !== null) {
    const content = match[1].trim()
    if (content) {
      blocks.push(content)
    }
  }

  return blocks
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: rawSlug } = await params

    // Decode the slug to handle URL encoding
    const slug = decodeURIComponent(rawSlug)

    // Live directory-map generator: reflect active filesystem state
    if (slug.startsWith('directory-map:live')) {
      const parts = slug.split(':').slice(2) // e.g., ["app", "api", "(backend)"]
      const charts = await buildLiveDirectoryMap(parts)
      return NextResponse.json({
        charts,
        updatedAt: new Date().toISOString(),
        path: parts.join('/') || '(repo-root)',
        slug,
        chartsCount: charts.length,
        source: 'live-filesystem',
      })
    }

    // Special dynamic slugs powered by live Appwrite schema
    if (slug === 'project-map:schema' || slug === 'project-map:schema:live') {
      try {
        if (!isServerConfigured()) {
          // Fallback to static docs if server credentials are missing
          const fallback = await buildChartsFromFile('diagrams/project-map/schema.md')
          return NextResponse.json({ ...fallback, source: 'static-fallback' })
        }

        const charts = await buildLiveSchemaMermaid()
        return NextResponse.json({
          charts,
          updatedAt: new Date().toISOString(),
          path: '(dynamic) appwrite-schema',
          slug,
          chartsCount: charts.length,
          source: 'appwrite-live',
        })
      } catch (error: any) {
        // On error, fall back to static file if available
        const fallback = await buildChartsFromFile('diagrams/project-map/schema.md')
        return NextResponse.json({
          ...fallback,
          error: error?.message || String(error),
          source: 'error-fallback',
        })
      }
    }

    // Map slugs to file paths - organized into categories
    const fileMap: Record<string, string> = {
      // Project Map (repository structure)
      'project-map:app': 'diagrams/project-map/app.md',
      'project-map:app:dashboard': 'diagrams/project-map/app.dashboard.md',
      'project-map:app:draft': 'diagrams/project-map/app.draft.md',
      'project-map:app:marketing': 'diagrams/project-map/app.marketing.md',
      'project-map:app:admin': 'diagrams/project-map/app.admin.md',
      'project-map:app:api': 'diagrams/project-map/app.api.md',
      'project-map:components': 'diagrams/project-map/components.md',
      'project-map:lib': 'diagrams/project-map/lib.md',
      'project-map:data': 'diagrams/project-map/data.md',
      // schema slug is handled above dynamically; keep here only for explicit static access if needed elsewhere
      'project-map:schema:static': 'diagrams/project-map/schema.md',
      'project-map:future': 'diagrams/project-map/future.md',
      'project-map:functions': 'diagrams/project-map/functions.md',
      'project-map:docs': 'diagrams/project-map/docs.md',
      'project-map:ops': 'diagrams/project-map/ops.md',
      'project-map:public': 'diagrams/project-map/public.md',

      // Directory Map (doc-style)
      'directory-map:index': 'diagrams/directory-map/index.md',
      'directory-map:overview': 'diagrams/directory-map/overview.md',
      'directory-map:chapters:app': 'diagrams/directory-map/chapters/app.md',
      'directory-map:chapters:components': 'diagrams/directory-map/chapters/components.md',
      'directory-map:chapters:lib': 'diagrams/directory-map/chapters/lib.md',
      'directory-map:chapters:docs': 'diagrams/directory-map/chapters/docs.md',
      'directory-map:chapters:functions': 'diagrams/directory-map/chapters/functions.md',
      'directory-map:chapters:schema': 'diagrams/directory-map/chapters/schema.md',
      'directory-map:chapters:ops': 'diagrams/directory-map/chapters/ops.md',

      // User Journeys (formerly Functional Flow)
      'user-journeys:auth-user-flow': 'diagrams/user-journeys/auth-user-flow.md',
      'user-journeys:auth:sign-in-up': 'diagrams/user-journeys/auth-sign-in-up.md',
      'user-journeys:auth:oauth-callback': 'diagrams/user-journeys/auth-oauth-callback.md',
      'user-journeys:auth:invite-join-and-draft-room':
        'diagrams/user-journeys/auth-invite-join-and-draft-room.md',
      'user-journeys:leagues-user-flow': 'diagrams/user-journeys/leagues-user-flow.md',
      'user-journeys:draft-user-flow': 'diagrams/user-journeys/draft-user-flow.md',
      'user-journeys:projections-user-flow': 'diagrams/user-journeys/projections-user-flow.md',
      'user-journeys:scoring-user-flow': 'diagrams/user-journeys/scoring-user-flow.md',
      'user-journeys:realtime-user-flow': 'diagrams/user-journeys/realtime-user-flow.md',
      'user-journeys:ops-deploy-user-flow': 'diagrams/user-journeys/ops-deploy-user-flow.md',
      // Back-compat aliases routed to current user-journeys sources
      'user-journeys:create-account': 'diagrams/user-journeys/auth-sign-in-up.md',
      'user-journeys:create-league': 'diagrams/user-journeys/leagues-user-flow.md',
      'user-journeys:join-league': 'diagrams/user-journeys/auth-invite-join-and-draft-room.md',

      // Functional Flow (legacy namespace retained for compatibility)
      // Legacy Functional Flow slugs → current user journeys
      'functional-flow:create-account': 'diagrams/user-journeys/auth-sign-in-up.md',
      'functional-flow:create-league': 'diagrams/user-journeys/leagues-user-flow.md',
      'functional-flow:join-league': 'diagrams/user-journeys/auth-invite-join-and-draft-room.md',
      'functional-flow:draft': 'diagrams/user-journeys/draft-user-flow.md',
      'functional-flow:draft:mock': 'diagrams/user-journeys/draft-user-flow.md',
      'functional-flow:draft:real': 'diagrams/user-journeys/draft-user-flow.md',

      // System Architecture (technical systems)
      'system-architecture:projections-overview':
        'diagrams/system-architecture/projections-system-overview.md',
      'system-architecture:yearly-projections':
        'diagrams/system-architecture/yearly-projections-flow-draft.md',
      'system-architecture:weekly-projections':
        'diagrams/system-architecture/weekly-projections-flow-in-season.md',
      'system-architecture:weight-tuning': 'diagrams/system-architecture/weight-tuning-loop.md',

      // API Documentation (generated)
      'api:routes': 'diagrams/api/routes.md',
      'api:external': 'diagrams/api/external.md',
      'api:data-sources': 'diagrams/api/data-sources.md',

      // Reports
      'report:main': 'diagrams/report.md',
      'report:route-status': 'diagrams/runtime/route-status.json',

      // Draft (custom mermaid diagrams) — moved to .drawio; mermaid slugs removed

      // Site Map (web/mobile; active/final)
      'sitemap:web:active': 'diagrams/site map/sitemap-web-active.md',
      'sitemap:mobile:active': 'diagrams/site map/sitemap-mobile-active.md',
      'sitemap:web:final': 'diagrams/site map/sitemap-web-final.md',
      'sitemap:mobile:final': 'diagrams/site map/sitemap-mobile-final.md',

      // Workflows (new)
      'workflows:index': 'diagrams/workflows/index.md',
      'workflows:ship-feature': 'diagrams/workflows/ship-feature.md',
      'workflows:fix-prod-incident': 'diagrams/workflows/fix-prod-incident.md',
      'workflows:change-database-safely': 'diagrams/workflows/change-database-safely.md',
      'workflows:track-events-correctly': 'diagrams/workflows/track-events-correctly.md',
      'workflows:design-to-code': 'diagrams/workflows/design-to-code.md',
      'workflows:launch-campaign': 'diagrams/workflows/launch-campaign.md',
      'workflows:design-3d-animations': 'diagrams/workflows/design-3d-animations.md',
    }

    // Handle dynamic multi-level project map paths
    if (slug.startsWith('project-map:app:')) {
      const parts = slug.split(':')
      if (parts.length >= 3) {
        // Convert slug parts to file path
        // project-map:app:api:admin -> diagrams/project-map/app.api.admin.md
        const pathParts = parts.slice(1) // Remove 'project-map'
        const filePath = `diagrams/project-map/${pathParts.join('.')}.md`

        // Also check for index.md in folder structure
        const folderIndexPath = `diagrams/project-map/${pathParts.join('/')}/index.md`

        const docsPath = path.join(process.cwd(), 'docs')
        const fullFilePath = path.join(docsPath, filePath)
        const fullIndexPath = path.join(docsPath, folderIndexPath)

        // Prioritize index.md in nested folder, otherwise use dotted file
        if (fs.existsSync(fullIndexPath)) {
          fileMap[slug] = folderIndexPath
        } else if (fs.existsSync(fullFilePath)) {
          fileMap[slug] = filePath
        }
      }
    }

    // Generic resolver for new project-map folder structure
    if (slug.startsWith('project-map:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        const folderPath = `diagrams/project-map/${parts.join('/')}.md`
        const docsPath = path.join(process.cwd(), 'docs')
        const fullFolderPath = path.join(docsPath, folderPath)
        if (fs.existsSync(fullFolderPath)) {
          fileMap[slug] = folderPath
        }
      }
    }

    // Generic resolver for draft domain folder structure
    if (slug.startsWith('draft:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        const folderPath = `diagrams/draft/${parts.join('/')}.md`
        const docsPath = path.join(process.cwd(), 'docs')
        const fullFolderPath = path.join(docsPath, folderPath)
        if (fs.existsSync(fullFolderPath)) {
          fileMap[slug] = folderPath
        }
      }
    }

    // Generic resolver for entity-relations folder structure
    if (slug.startsWith('entity-relations:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        const folderPath = `diagrams/entity-relations/${parts.join('/')}.md`
        const docsPath = path.join(process.cwd(), 'docs')
        const fullFolderPath = path.join(docsPath, folderPath)
        if (fs.existsSync(fullFolderPath)) {
          fileMap[slug] = folderPath
        }
      }
    }

    // Generic resolver for user-journeys folder structure
    if (slug.startsWith('user-journeys:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        // First try flattened auth-* filenames
        if (parts[0] === 'auth' && parts.length >= 2) {
          const flat = `diagrams/user-journeys/auth-${parts.slice(1).join('-')}.md`
          const docsPath = path.join(process.cwd(), 'docs')
          const fullFlat = path.join(docsPath, flat)
          if (fs.existsSync(fullFlat)) {
            fileMap[slug] = flat
          }
        }
        // Fallback to nested structure
        if (!fileMap[slug]) {
          const folderPath = `diagrams/user-journeys/${parts.join('/')}.md`
          const docsPath = path.join(process.cwd(), 'docs')
          const fullFolderPath = path.join(docsPath, folderPath)
          if (fs.existsSync(fullFolderPath)) {
            fileMap[slug] = folderPath
          }
        }
      }
    }

    // Generic resolver for functional-flow folder structure (legacy)
    if (slug.startsWith('functional-flow:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        const folderPath = `diagrams/functional-flow/${parts.join('/')}.md`
        const docsPath = path.join(process.cwd(), 'docs')
        const fullFolderPath = path.join(docsPath, folderPath)
        if (fs.existsSync(fullFolderPath)) {
          fileMap[slug] = folderPath
        } else {
          // Attempt redirect-style resolution into new user-journeys location
          const altPath = `diagrams/user-journeys/${parts.join('/')}.md`
          const fullAlt = path.join(docsPath, altPath)
          if (fs.existsSync(fullAlt)) {
            fileMap[slug] = altPath
          }
        }
      }
    }

    // Generic resolver for sitemap folder (supports sitemap:web:active -> diagrams/site map/sitemap-web-active.md)
    if (slug.startsWith('sitemap:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        const hyphenFile = `diagrams/site map/sitemap-${parts.join('-')}.md`
        const docsPath = path.join(process.cwd(), 'docs')
        const fullPath = path.join(docsPath, hyphenFile)
        if (fs.existsSync(fullPath)) {
          fileMap[slug] = hyphenFile
        }
      }
    }

    // Generic resolver for directory-map folder structure
    if (slug.startsWith('directory-map:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        const folderPath = `diagrams/directory-map/${parts.join('/')}.md`
        const docsPath = path.join(process.cwd(), 'docs')
        const fullFolderPath = path.join(docsPath, folderPath)
        if (fs.existsSync(fullFolderPath)) {
          fileMap[slug] = folderPath
        }
      }
    }

    // Generic resolver for workflows folder structure
    if (slug.startsWith('workflows:')) {
      const parts = slug.split(':').slice(1)
      if (parts.length) {
        const folderPath = `diagrams/workflows/${parts.join('/')}.md`
        const docsPath = path.join(process.cwd(), 'docs')
        const fullFolderPath = path.join(docsPath, folderPath)
        if (fs.existsSync(fullFolderPath)) {
          fileMap[slug] = folderPath
        }
      }
    }

    // Helper: attempt to resolve a diagram path using new flattened filenames
    const docsRoot = path.join(process.cwd(), 'docs')
    function existsRel(rel: string): boolean {
      try {
        return fs.existsSync(path.join(docsRoot, rel))
      } catch (error) {
        console.warn('Error checking file existence:', error)
        return false
      }
    }

    function resolveFallback(s: string): string | null {
      // project-map:* fallbacks
      if (s.startsWith('project-map:')) {
        const parts = s.split(':').slice(1)
        if (parts.length >= 1) {
          // Try old dotted path first
          const dotted = `diagrams/project-map/${parts.join('.')}.md`
          if (existsRel(dotted)) return dotted
          // Try flattened: project-map-<parts-joined-by-hyphen>.md
          const flat = `diagrams/project-map/project-map-${parts.join('-')}.md`
          if (existsRel(flat)) return flat
          // For top-level roots also try <root>.md
          if (parts.length === 1) {
            const simple = `diagrams/project-map/${parts[0]}.md`
            if (existsRel(simple)) return simple
          }
        }
      }
      // functional-flow:* fallbacks
      if (s.startsWith('functional-flow:')) {
        const name = s.split(':')[1]
        const dir = path.join(docsRoot, 'diagrams', 'functional-flow')
        try {
          const files = fs.readdirSync(dir)
          const exact = `${name}.md`
          if (files.includes(exact)) return path.join('diagrams', 'functional-flow', exact)
          const starts = files.find(
            f => f.toLowerCase().startsWith(`${name}-`) && f.endsWith('.md')
          )
          if (starts) return path.join('diagrams', 'functional-flow', starts)
          const contains = files.find(f => f.toLowerCase().includes(name) && f.endsWith('.md'))
          if (contains) return path.join('diagrams', 'functional-flow', contains)
        } catch {}
      }
      // system-architecture:* fallbacks
      if (s.startsWith('system-architecture:')) {
        const name = s.split(':')[1]
        const dir = path.join(docsRoot, 'diagrams', 'system-architecture')
        try {
          const files = fs.readdirSync(dir)
          const exact = `${name}.md`
          if (files.includes(exact)) return path.join('diagrams', 'system-architecture', exact)
          const starts = files.find(f => f.toLowerCase().startsWith(name) && f.endsWith('.md'))
          if (starts) return path.join('diagrams', 'system-architecture', starts)
          const contains = files.find(f => f.toLowerCase().includes(name) && f.endsWith('.md'))
          if (contains) return path.join('diagrams', 'system-architecture', contains)
        } catch {}
      }
      // sitemap:* fallbacks
      if (s.startsWith('sitemap:')) {
        const name = s.split(':').slice(1).join('-')
        const dir = path.join(docsRoot, 'diagrams', 'site map')
        try {
          const files = fs.readdirSync(dir)
          const exact = `sitemap-${name}.md`
          if (files.includes(exact)) return path.join('diagrams', 'site map', exact)
          const starts = files.find(
            f => f.toLowerCase().startsWith(`sitemap-${name}`) && f.endsWith('.md')
          )
          if (starts) return path.join('diagrams', 'site map', starts)
          const contains = files.find(f => f.toLowerCase().includes(name) && f.endsWith('.md'))
          if (contains) return path.join('diagrams', 'site map', contains)
        } catch {}
      }
      return null
    }

    let filePath = fileMap[slug]
    // If not mapped, or mapped path no longer exists after reorganization, try fallback resolvers
    if (!filePath || !existsRel(filePath)) {
      const fb = resolveFallback(slug)
      if (fb) filePath = fb
    }

    if (!filePath) {
      console.error(`Diagram not found for slug: ${slug}`)
      console.error('Available slugs:', Object.keys(fileMap))

      return NextResponse.json(
        {
          error: 'Diagram not found',
          slug,
          receivedSlug: rawSlug,
          decodedSlug: slug,
          availableKeys: Object.keys(fileMap),
        },
        { status: 404 }
      )
    }

    try {
      const result = await buildChartsFromFile(filePath)
      return NextResponse.json(result)
    } catch (error: any) {
      console.error(`Error reading diagram for slug ${slug}:`, error)

      return NextResponse.json(
        {
          error: 'Failed to read diagram',
          details: error?.message || 'Unknown error',
          path: filePath,
          slug,
        },
        { status: 500 }
      )
    }
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Unhandled error', message: e?.message || String(e), stack: e?.stack || null },
      { status: 500 }
    )
  }
}

async function buildChartsFromFile(filePath: string) {
  try {
    const docsPath = path.join(process.cwd(), 'docs')
    const fullPath = path.join(docsPath, filePath)

    if (!fs.existsSync(fullPath)) {
      return {
        error: 'File not found',
        path: filePath,
        fullPath: fullPath.replace(process.cwd(), '...'),
        exists: false,
        charts: [],
        updatedAt: new Date().toISOString(),
      }
    }

    const content = fs.readFileSync(fullPath, 'utf-8')
    const charts = extractMermaidBlocks(content)
    const stats = fs.statSync(fullPath)

    // Try to read updated timestamp from frontmatter if present
    let updatedAt = stats.mtime.toISOString()
    try {
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (fmMatch) {
        const fm = fmMatch[1]
        const lines = fm.split(/\r?\n/)
        for (const line of lines) {
          const m = line.match(/^updated:\s*(.+)$/)
          if (m) {
            const iso = m[1].trim().replace(/^"|"$/g, '')
            const d = new Date(iso)
            if (!isNaN(d.getTime())) updatedAt = d.toISOString()
            break
          }
        }
      }
    } catch {}

    return {
      charts,
      updatedAt,
      path: filePath,
      slug: filePath,
      chartsCount: charts.length,
    }
  } catch (error: any) {
    console.error('Error in buildChartsFromFile:', error)
    return {
      error: 'Failed to read file',
      details: error?.message || 'Unknown error',
      path: filePath,
      charts: [],
      updatedAt: new Date().toISOString(),
    }
  }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '\\"')
}

async function buildLiveDirectoryMap(pathParts: string[]): Promise<string[]> {
  // Build a Mermaid diagram reflecting current filesystem for a given path under repo root
  // pathParts: [] -> repo root; ["app"] -> app/; ["app","api"] -> app/api/
  const base = path.join(process.cwd(), ...pathParts)
  const relLabel = (pathParts.length ? pathParts.join('/') : 'Repo Root') + '/'
  const entries: Array<{ name: string; type: 'file' | 'dir' }> = []
  try {
    const dir = fs.readdirSync(base, { withFileTypes: true })
    for (const d of dir) {
      if (d.name.startsWith('.')) continue
      // Skip node_modules to keep diagram readable
      if (d.name === 'node_modules' || d.name === '.next') continue
      entries.push({ name: d.name, type: d.isDirectory() ? 'dir' : 'file' })
    }
  } catch (e) {
    return [
      [
        'flowchart LR',
        'classDef folder fill:#ADD8E6,stroke:#6CB6D9,color:#003A8C,rx:6,ry:6;',
        'classDef file fill:#F5F5DC,stroke:#C9C9A3,color:#262626,rx:6,ry:6;',
        'classDef config fill:#9932CC,stroke:#6E259B,color:#FFFFFF,rx:6,ry:6;',
        'classDef generated fill:#DE5D83,stroke:#B34463,color:#FFFFFF,rx:6,ry:6;',
        'classDef test fill:#C41E3A,stroke:#8E1F2E,color:#FFFFFF,rx:6,ry:6;',
        'classDef legend fill:#FAFAFA,stroke:#D9D9D9,color:#595959,rx:6,ry:6;',
        `R["${esc(relLabel)}"]:::folder`,
        'Legend["Legend:\nFolder (Light Blue)\nFile (Beige)\n Config (DarkOrchid)\n Generated (Blush)\nTests (Cardinal)"]:::legend',
      ].join('\n'),
    ]
  }

  const lines: string[] = []
  lines.push('flowchart LR')
  lines.push('classDef folder fill:#ADD8E6,stroke:#6CB6D9,color:#003A8C,rx:6,ry:6;')
  lines.push('classDef file fill:#F5F5DC,stroke:#C9C9A3,color:#262626,rx:6,ry:6;')
  lines.push('classDef config fill:#9932CC,stroke:#6E259B,color:#FFFFFF,rx:6,ry:6;')
  lines.push('classDef generated fill:#DE5D83,stroke:#B34463,color:#FFFFFF,rx:6,ry:6;')
  lines.push('classDef test fill:#C41E3A,stroke:#8E1F2E,color:#FFFFFF,rx:6,ry:6;')
  lines.push('classDef legend fill:#FAFAFA,stroke:#D9D9D9,color:#595959,rx:6,ry:6;')
  lines.push(`R["${esc(relLabel)}"]:::folder`)

  // Deterministic ordering: dirs first, then files, alpha
  const sorted = entries.sort((a, b) =>
    a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1
  )
  let idx = 0
  for (const e of sorted) {
    idx += 1
    const id = `${e.type === 'dir' ? 'D' : 'F'}${idx}`
    const label = e.name + (e.type === 'dir' ? '/' : '')
    const cls = e.type === 'dir' ? 'folder' : classifyFile(e.name)
    lines.push(`R --> ${id}["${esc(label)}"]:::${cls}`)
    if (e.type === 'dir') {
      const nextSlug = ['directory-map', 'live', ...pathParts, e.name].join(':')
      lines.push(`click ${id} "/admin/diagrams/${nextSlug}" "Open ${esc(label)}" _blank`)
    }
  }

  lines.push(
    'Legend["Legend:\nFolder (Light Blue)\nFile (Beige)\n Config (DarkOrchid)\n Generated (Blush)\nTests (Cardinal)"]:::legend'
  )
  return [lines.join('\n')]
}

function classifyFile(name: string): 'file' | 'config' | 'generated' | 'test' {
  const lower = name.toLowerCase()
  if (
    lower.endsWith('.config.js') ||
    lower.endsWith('.config.ts') ||
    lower === 'tsconfig.json' ||
    lower === 'tailwind.config.js' ||
    lower === 'next.config.js' ||
    lower === 'postcss.config.mjs'
  ) {
    return 'config'
  }
  if (
    lower.includes('.generated') ||
    lower.includes('-generated') ||
    lower.includes('appwrite-types')
  ) {
    return 'generated'
  }
  if (
    lower.endsWith('.spec.ts') ||
    lower.endsWith('.spec.tsx') ||
    lower.endsWith('.test.ts') ||
    lower.endsWith('.test.tsx')
  ) {
    return 'test'
  }
  return 'file'
}
async function buildLiveSchemaMermaid(): Promise<string[]> {
  const collectionsRes: any = await serverDatabases.listCollections(DATABASE_ID)
  const collections: any[] = collectionsRes.collections || []

  // Pull attributes and indexes per collection in parallel
  const details = await Promise.all(
    collections.map(async c => {
      const [attrs, idxs] = await Promise.all([
        serverDatabases
          .listAttributes(DATABASE_ID, c.$id as string)
          .catch(() => ({ attributes: [] })),
        serverDatabases.listIndexes(DATABASE_ID, c.$id as string).catch(() => ({ indexes: [] })),
      ])
      return {
        id: c.$id as string,
        name: (c.name as string) || c.$id,
        attributes: (attrs as any).attributes || [],
        indexes: (idxs as any).indexes || [],
      }
    })
  )

  // Sort for stable output
  details.sort((a, b) => a.id.localeCompare(b.id))

  let md = ''
  md += 'graph TB\n'
  md += '  classDef coll fill:#0ea5e9,stroke:#0369a1,stroke-width:2,color:#fff,rx:6,ry:6\n'
  md += '  classDef attr fill:#111827,stroke:#334155,stroke-width:1,color:#e5e7eb,rx:4,ry:4\n'
  md += '  classDef idx fill:#1f2937,stroke:#4b5563,stroke-width:1,color:#d1d5db,rx:4,ry:4\n'

  for (const d of details) {
    const attrsLines: string[] = []
    const sortedAttrs = [...d.attributes].sort((a: any, b: any) =>
      String(a.key || '').localeCompare(String(b.key || ''))
    )
    for (const a of sortedAttrs) {
      const key = esc(String(a.key || a.name || ''))
      const type = esc(String(a.type || a.kind || ''))
      const req = a.required ? 'required' : 'optional'
      const def =
        a.default !== undefined && a.default !== null ? ` = ${esc(String(a.default))}` : ''
      attrsLines.push(`- ${key}: ${type} (${req})${def}`)
    }
    const idxLines: string[] = []
    const sortedIdxs = [...d.indexes].sort((a: any, b: any) =>
      String(a.key || a.name || '').localeCompare(String(b.key || b.name || ''))
    )
    for (const ix of sortedIdxs) {
      const name = esc(String(ix.key || ix.name || 'index'))
      const fields = Array.isArray(ix.attributes)
        ? ix.attributes.map((f: string) => esc(f)).join(' | ')
        : ''
      const unique = ix.unique ? 'unique' : 'normal'
      idxLines.push(`${name}: [${fields}] ${unique}`)
    }

    const labelParts: string[] = []
    labelParts.push(`<b>${esc(d.id)}</b>`) // collection id
    if (d.name && d.name !== d.id) labelParts.push(`<i>${esc(d.name)}</i>`)
    if (attrsLines.length) {
      labelParts.push('<hr/>')
      for (const line of attrsLines) labelParts.push(esc(line))
    }
    if (idxLines.length) {
      labelParts.push('<hr/><i>Indexes</i>')
      for (const line of idxLines) labelParts.push(esc(line))
    }

    // One node per collection with multiline HTML label
    const nodeId = `col_${d.id.replace(/[^a-zA-Z0-9_]/g, '_')}`
    const label = labelParts.join('<br/>')
    md += `  ${nodeId}[\"${label}\"]:::coll\n`
  }

  return [md]
}
