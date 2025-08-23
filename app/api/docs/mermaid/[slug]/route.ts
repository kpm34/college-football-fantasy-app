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
  const { slug: rawSlug } = await params
  
  // Decode the slug to handle URL encoding
  const slug = decodeURIComponent(rawSlug)

  // Map slugs to file paths - organized into 3 main categories
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
    'project-map:schema': 'diagrams/project-map/schema.md',
    'project-map:future': 'diagrams/project-map/future.md',
    'project-map:functions': 'diagrams/project-map/functions.md',
    'project-map:docs': 'diagrams/project-map/docs.md',
    'project-map:ops': 'diagrams/project-map/ops.md',
    'project-map:public': 'diagrams/project-map/public.md',
    
    // Functional Flow (user journeys and features)
    'functional-flow:create-account': 'diagrams/functional-flow/create-account.md',
    'functional-flow:create-league': 'diagrams/functional-flow/create-league.md',
    'functional-flow:join-league': 'diagrams/functional-flow/join-league.md',
    'functional-flow:draft': 'diagrams/functional-flow/draft.md',
    
    // System Architecture (technical systems)
    'system-architecture:projections-overview': 'diagrams/system-architecture/projections-overview.md',
    'system-architecture:yearly-projections': 'diagrams/system-architecture/yearly-projections.md',
    'system-architecture:weekly-projections': 'diagrams/system-architecture/weekly-projections.md',
    'system-architecture:weight-tuning': 'diagrams/system-architecture/weight-tuning.md',
    
    // API Documentation (generated)
    'api:routes': 'diagrams/api/routes.md',
    'api:external': 'diagrams/api/external.md',
    'api:data-sources': 'diagrams/api/data-sources.md',
    
    // Reports
    'report:main': 'diagrams/report.md',
    'report:route-status': 'diagrams/runtime/route-status.json',
  }

  // Handle dynamic 3-level project map paths
  if (slug.startsWith('project-map:app:')) {
    const parts = slug.split(':')
    if (parts.length === 3) {
      const [, root, group] = parts
      // First check for index.md in the group folder
      const indexPath = `diagrams/project-map/${root}.${group}/index.md`
      const groupPath = `diagrams/project-map/${root}.${group}.md`
      
      // Prioritize index.md if it exists
      const docsPath = path.join(process.cwd(), 'docs')
      const fullIndexPath = path.join(docsPath, indexPath)
      
      if (fs.existsSync(fullIndexPath)) {
        fileMap[slug] = indexPath
      } else {
        fileMap[slug] = groupPath
      }
    }
  }

  const filePath = fileMap[slug]
  
  if (!filePath) {
    console.error(`Diagram not found for slug: ${slug}`)
    console.error('Available slugs:', Object.keys(fileMap))
    
    return NextResponse.json(
      { 
        error: 'Diagram not found', 
        slug,
        receivedSlug: rawSlug,
        decodedSlug: slug,
        availableKeys: Object.keys(fileMap)
      },
      { status: 404 }
    )
  }

  try {
    const docsPath = path.join(process.cwd(), 'docs')
    const fullPath = path.join(docsPath, filePath)
    
    console.log(`Attempting to read: ${fullPath}`)
    
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`)
      
      return NextResponse.json(
        { 
          error: 'File not found', 
          path: filePath,
          fullPath: fullPath.replace(process.cwd(), '...'),
          slug,
          exists: false
        },
        { status: 404 }
      )
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8')
    const charts = extractMermaidBlocks(content)
    
    console.log(`Found ${charts.length} charts in ${filePath}`)
    
    const stats = fs.statSync(fullPath)
    
    return NextResponse.json({
      charts,
      updatedAt: stats.mtime.toISOString(),
      path: filePath,
      slug,
      chartsCount: charts.length
    })
  } catch (error: any) {
    console.error(`Error reading diagram for slug ${slug}:`, error)
    
    return NextResponse.json(
      { 
        error: 'Failed to read diagram', 
        details: error?.message || 'Unknown error',
        path: filePath,
        slug
      },
      { status: 500 }
    )
  }
}