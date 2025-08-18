import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = []
  // Support optional attributes after mermaid and both LF and CRLF newlines
  const regex = /```mermaid[^\n]*\r?\n([\s\S]*?)```/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(markdown))) {
    blocks.push(match[1].trim())
  }
  return blocks
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

  // Try primary path; on failure or zero charts, fall back to common alternates
  const candidates = [rel]
  if (slug === 'project-map') candidates.push('PROJECT_MAP.md')

  for (const candidate of candidates) {
    try {
      const absolutePath = path.join(process.cwd(), candidate)
      const [content, stat] = await Promise.all([
        fs.readFile(absolutePath, 'utf8'),
        fs.stat(absolutePath),
      ])
      const charts = extractMermaidBlocks(content)
      if (charts.length > 0) {
        return NextResponse.json({ charts, updatedAt: stat.mtime.toISOString(), source: candidate })
      }
    } catch {}
  }

  return NextResponse.json({ charts: [], error: 'No diagrams found', tried: candidates }, { status: 200 })
}

export const runtime = 'nodejs'


