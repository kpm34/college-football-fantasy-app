import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
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

  // Map slugs to file paths - now using individual diagram files
  const fileMap: Record<string, string> = {
    // Legacy mappings for existing pages
    'data-flow': 'docs/DATA_FLOW.md',
    'project-map': 'docs/PROJECT_MAP.md',
    'system-map': 'docs/SYSTEM_MAP.md',
    
    // Projections System Diagrams
    'projections-overview': 'docs/diagrams/projections-overview.md',
    'projections-algorithm': 'docs/diagrams/projections-algorithm.md',
    'depth-multipliers': 'docs/diagrams/depth-multipliers.md',
    'data-sources': 'docs/diagrams/data-sources.md',
    'api-flow': 'docs/diagrams/api-flow.md',
    'troubleshooting': 'docs/diagrams/troubleshooting.md',
    
    // System Architecture Diagrams
    'repository-structure': 'docs/diagrams/repository-structure.md',
    'system-architecture': 'docs/diagrams/system-architecture.md',
    'authentication-flow': 'docs/diagrams/authentication-flow.md',
    
    // League & Draft Management
    'league-management': 'docs/diagrams/league-management.md',
    'draft-realtime': 'docs/diagrams/draft-realtime.md',
    'search-filter-flow': 'docs/diagrams/search-filter-flow.md',
    
    // Admin & Commissioner Tools
    'admin-operations': 'docs/diagrams/admin-operations.md',
    'commissioner-settings': 'docs/diagrams/commissioner-settings.md',
    
    // Catch-all for projections (loads overview)
    'projections': 'docs/diagrams/projections-overview.md',
  }

  const rel = fileMap[slug]
  if (!rel) {
    return NextResponse.json({ 
      error: 'Not found', 
      availableSlugs: Object.keys(fileMap) 
    }, { status: 404 })
  }

  // Try multiple possible paths for Vercel serverless environment
  const allCandidates = [
    path.join(process.cwd(), rel),        // /var/task/docs/... (most likely in Vercel)
    path.join('/var/task', rel),          // Vercel Lambda direct path
    path.join('.', rel),                  // ./docs/...
    rel,                                   // relative path
    path.join(__dirname, '..', '..', '..', '..', '..', rel), // relative to API route
  ]

  for (const candidate of allCandidates) {
    try {
      const absolutePath = path.resolve(candidate)
      
      // Check if file exists first
      const fileExists = await fs.access(absolutePath).then(() => true).catch(() => false)
      
      if (!fileExists) {
        continue
      }
      
      const [content, stat] = await Promise.all([
        fs.readFile(absolutePath, 'utf8'),
        fs.stat(absolutePath),
      ])
      
      const charts = extractMermaidBlocks(content)
      
      if (charts.length > 0) {
        return NextResponse.json(
          { 
            charts, 
            updatedAt: stat.mtime.toISOString(), 
            source: candidate,
            slug: slug,
            fileName: path.basename(rel)
          },
          { 
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        )
      } else {
        // Return empty charts array but with metadata
        return NextResponse.json(
          { 
            charts: [], 
            error: 'No diagrams found in file', 
            source: candidate,
            slug: slug,
            fileName: path.basename(rel),
            contentLength: content.length
          },
          { 
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        )
      }
    } catch (error) {
      // Continue to next candidate
    }
  }

  // If we get here, file wasn't found
  return NextResponse.json({ 
    charts: [], 
    error: 'File not found', 
    tried: allCandidates.map(c => path.resolve(c)),
    workingDir: process.cwd(),
    slug: slug
  }, { status: 404 })
}

export const runtime = 'nodejs'