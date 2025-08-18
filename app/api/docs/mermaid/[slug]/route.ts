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

async function listDirectoryContents(dirPath: string): Promise<string[]> {
  try {
    const items = await fs.readdir(dirPath)
    return items
  } catch {
    return []
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const fileMap: Record<string, string> = {
    'data-flow': 'docs/DATA_FLOW.md',
    'project-map': 'docs/PROJECT_MAP.md',
    'system-map': 'docs/SYSTEM_MAP.md',
  }

  const rel = fileMap[slug]
  if (!rel) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // No fallback needed since we're using the correct file directly
  const candidates = [rel]

  // Try multiple possible paths for Vercel serverless environment
  const allCandidates = [
    path.join(process.cwd(), 'public', rel), // /var/task/public/docs/PROJECT_MAP.md (most likely)
    path.join(process.cwd(), rel),        // /var/task/docs/PROJECT_MAP.md
    path.join('/var/task/public', rel),   // Vercel public directory
    path.join('/var/task', rel),          // Vercel Lambda direct path
    rel,                                  // relative path
    path.join('.', rel),                  // ./docs/PROJECT_MAP.md
    path.join('public', rel),             // public/docs/PROJECT_MAP.md
    path.join(__dirname, '..', '..', '..', '..', '..', 'public', rel), // relative to API route
  ]

  for (const candidate of allCandidates) {
    try {
      const absolutePath = path.resolve(candidate)
      
      // Check if file exists first
      console.log('Trying path:', absolutePath)
      const fileExists = await fs.access(absolutePath).then(() => true).catch(() => false)
      console.log('File exists:', fileExists)
      
      if (!fileExists) {
        console.log('File does not exist, skipping:', absolutePath)
        continue
      }
      
      const [content, stat] = await Promise.all([
        fs.readFile(absolutePath, 'utf8'),
        fs.stat(absolutePath),
      ])
      const charts = extractMermaidBlocks(content)
      
      // Return debug info even if no charts found
      const debugInfo = {
        fileLength: content.length,
        containsMermaid: content.includes('```mermaid'),
        containsClosing: content.includes('```'),
        first200Chars: content.substring(0, 200),
        mermaidCount: (content.match(/```mermaid/g) || []).length,
        closingCount: (content.match(/```/g) || []).length
      }
      
      if (charts.length > 0) {
        return NextResponse.json(
          { charts, updatedAt: stat.mtime.toISOString(), source: candidate, debug: debugInfo },
          { 
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        )
      } else {
        // Return debug info when no charts found
        return NextResponse.json(
          { charts: [], error: 'No diagrams found', source: candidate, debug: debugInfo },
          { 
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        )
      }
    } catch {}
  }

  // Enhanced debug info for troubleshooting
  return NextResponse.json({ 
    charts: [], 
    error: 'No diagrams found', 
    tried: allCandidates.map(c => path.resolve(c)),
    workingDir: process.cwd(),
    debug: {
      processEnv: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      },
      allFiles: await listDirectoryContents(process.cwd()),
      publicFiles: await listDirectoryContents(path.join(process.cwd(), 'public')).catch(() => 'not found')
    }
  }, { status: 200 })

}

export const runtime = 'nodejs'


