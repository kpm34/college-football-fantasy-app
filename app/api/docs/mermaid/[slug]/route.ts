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
    'data-flow': 'DATA_FLOW.md',
    'project-map': 'PROJECT_MAP.md',
    'system-map': 'SYSTEM_MAP.md',
    
    // Projections System Diagrams
    'projections-overview': 'diagrams/projections-overview.md',
    'projections-algorithm': 'diagrams/projections-algorithm.md',
    'depth-multipliers': 'diagrams/depth-multipliers.md',
    'data-sources': 'diagrams/data-sources.md',
    'api-flow': 'diagrams/api-flow.md',
    'troubleshooting': 'diagrams/troubleshooting.md',
    
    // System Architecture Diagrams
    'repository-structure': 'diagrams/repository-structure.md',
    'system-architecture': 'diagrams/system-architecture.md',
    'authentication-flow': 'diagrams/authentication-flow.md',
    
    // League & Draft Management
    'league-management': 'diagrams/league-management.md',
    'draft-realtime': 'diagrams/draft-realtime.md',
    'search-filter-flow': 'diagrams/search-filter-flow.md',
    
    // Admin & Commissioner Tools
    'admin-operations': 'diagrams/admin-operations.md',
    'commissioner-settings': 'diagrams/commissioner-settings.md',
    
    // Catch-all for projections (loads overview)
    'projections': 'diagrams/projections-overview.md',
  }

  const fileName = fileMap[slug]
  if (!fileName) {
    return NextResponse.json({ 
      error: 'Not found', 
      availableSlugs: Object.keys(fileMap) 
    }, { status: 404 })
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