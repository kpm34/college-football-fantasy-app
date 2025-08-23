import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

function extractMermaidBlocks(markdown: string): string[] {
  // Simple, reliable regex that definitely works
  const mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n```/g
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
  const { slug } = await params

  // Map slugs to file paths
  const fileMap: Record<string, string> = {
    // Legacy mappings for existing pages
    'data-flow': 'diagrams/system-architecture/complete-data-flow.md',
    // Project Map (split by root folders)
    'project-map:app': 'diagrams/system-architecture/project-map/app.md',
    'project-map:app:dashboard': 'diagrams/system-architecture/project-map/app.dashboard.md',
    'project-map:app:draft': 'diagrams/system-architecture/project-map/app.draft.md',
    'project-map:app:marketing': 'diagrams/system-architecture/project-map/app.marketing.md',
    'project-map:app:admin': 'diagrams/system-architecture/project-map/app.admin.md',
    'project-map:app:api': 'diagrams/system-architecture/project-map/app.api.md',
    'project-map:components': 'diagrams/system-architecture/project-map/components.md',
    'project-map:lib': 'diagrams/system-architecture/project-map/lib.md',
    'project-map:data': 'diagrams/system-architecture/project-map/data.md',
    'project-map:schema': 'diagrams/system-architecture/project-map/schema.md',
    'project-map:future': 'diagrams/system-architecture/project-map/future.md',
    'project-map:functions': 'diagrams/system-architecture/project-map/functions.md',
    'project-map:docs': 'diagrams/system-architecture/project-map/docs.md',
    'project-map:ops': 'diagrams/system-architecture/project-map/ops.md',
    'project-map:public': 'diagrams/system-architecture/project-map/public.md',
    'system-map': 'diagrams/SYSTEM_MAP.md',
    
    // Projections System Diagrams
    'projections-overview': 'diagrams/projections/projections-overview.md',
    'projections-algorithm': 'diagrams/projections/projections-algorithm.md',
    'depth-multipliers': 'diagrams/projections/depth-multipliers.md',
    'data-sources': 'diagrams/projections/data-sources.md',
    'api-flow': 'diagrams/projections/api-flow.md',
    'troubleshooting': 'diagrams/projections/troubleshooting.md',
    
    // System Architecture Diagrams
    'repository-structure': 'diagrams/system-architecture/repository-structure.md',
    'system-architecture': 'diagrams/system-architecture/system-architecture.md',
    'authentication-flow': 'diagrams/system-architecture/authentication-flow.md',
    
    // League & Draft Management
    'league-management': 'diagrams/league-draft/league-management.md',
    'draft-realtime': 'diagrams/league-draft/draft-realtime.md',
    'search-filter-flow': 'diagrams/league-draft/search-filter-flow.md',
    
    // Admin & Commissioner Tools
    'admin-operations': 'diagrams/admin-tools/admin-operations.md',
    'commissioner-settings': 'diagrams/admin-tools/commissioner-settings.md',
    
    // Catch-all for projections (loads overview)
    'projections': 'diagrams/projections/projections-overview.md',
  }

  let fileName = fileMap[slug]
  if (!fileName) {
    // Dynamic project-map routing: project-map:root(:group(:sub)?)
    if (slug.startsWith('project-map:')) {
      const parts = slug.replace('project-map:', '').split(':')
      const [root, group, sub] = parts
      if (root) {
        if (root && !group) fileName = `diagrams/system-architecture/project-map/${root}.md`
        if (root && group && !sub) fileName = `diagrams/system-architecture/project-map/${root}.${group}.md`
        if (root && group && sub) fileName = `diagrams/system-architecture/project-map/${root}.${group}.${sub}.md`
      }
    }
  }
  if (!fileName) {
    return NextResponse.json({ error: 'Not found', availableSlugs: Object.keys(fileMap), slug }, { status: 404 })
  }

  // Try multiple locations where docs might be
  const possiblePaths = [
    // Consolidated docs first
    path.join(process.cwd(), 'docs', fileName),
    // In production, docs are mirrored to public/docs by prebuild
    path.join(process.cwd(), 'public', 'docs', fileName),
    // Alternative: direct in public
    path.join(process.cwd(), 'public', fileName),
    // Vercel: common locations
    path.join('/var/task', 'docs', fileName),
    path.join('/var/task', 'public', 'docs', fileName),
  ]

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        const charts = extractMermaidBlocks(content)
        const stat = fs.statSync(filePath)
        
        if (charts.length > 0) {
          return NextResponse.json(
            { 
              charts, 
              updatedAt: stat.mtime.toISOString(), 
              source: filePath,
              slug: slug,
              fileName: fileName
            },
            { 
              headers: {
                'Cache-Control': 'public, max-age=3600',
              }
            }
          )
        } else {
          return NextResponse.json(
            { 
              charts: [], 
              error: 'No mermaid blocks found', 
              source: filePath,
              slug: slug,
              fileName: fileName,
              contentLength: content.length,
              contentPreview: content.substring(0, 200)
            },
            { 
              headers: {
                'Cache-Control': 'no-cache',
              }
            }
          )
        }
      }
    } catch (error) {
      // Continue to next path
      continue
    }
  }

  // If we get here, file wasn't found in any location
  return NextResponse.json({ 
    charts: [], 
    error: 'File not found in any location', 
    slug: slug,
    fileName: fileName,
    triedPaths: possiblePaths,
    workingDir: process.cwd(),
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL || 'false'
  }, { status: 404 })
}

export const runtime = 'nodejs'