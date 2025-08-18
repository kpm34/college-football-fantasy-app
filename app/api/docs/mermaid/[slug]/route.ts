import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs/promises'
import path from 'node:path'

function extractMermaidBlocks(markdown: string): string[] {
  const blocks: string[] = []
  const regex = /```mermaid\n([\s\S]*?)```/g
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
    'project-map': 'PROJECT_MAP.md',
  }

  const rel = fileMap[slug]
  if (!rel) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const absolutePath = path.join(process.cwd(), rel)
    const [content, stat] = await Promise.all([
      fs.readFile(absolutePath, 'utf8'),
      fs.stat(absolutePath),
    ])

    const charts = extractMermaidBlocks(content)
    return NextResponse.json({ charts, updatedAt: stat.mtime.toISOString() })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to load mermaid content' },
      { status: 500 }
    )
  }
}


