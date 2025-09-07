import { NextRequest, NextResponse } from 'next/server'
import { getLucidConfig } from '@/lib/config/lucid'
import JSZip from 'jszip'

export const runtime = 'nodejs'

async function getAccessTokenFromCookies(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('lucid_access_token')?.value
  return token || null
}

function mermaidToStandardImport(mermaidBlocks: string[]): any {
  // Minimal single-page document with one text shape per mermaid block
  const shapes = [] as any[]
  let y = 40
  for (let i = 0; i < mermaidBlocks.length; i++) {
    const text = mermaidBlocks[i]
    shapes.push({
      id: `shape_${i + 1}`,
      type: 'text',
      text: '```mermaid\n' + text + '\n```',
      bounds: { x: 40, y, width: 900, height: 120 },
      style: { fontSize: 12 },
    })
    y += 140
  }
  return {
    document: {
      title: 'Imported from Mermaid',
      product: 'lucidchart',
      pages: [
        {
          id: 'page_1',
          title: 'Page 1',
          shapes,
          lines: [],
          groups: [],
        },
      ],
    },
  }
}

async function loadMermaidBlocks(baseUrl: string, slug: string): Promise<string[]> {
  const res = await fetch(`${baseUrl}/api/docs/mermaid/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Failed to load mermaid for slug ${slug}`)
  }
  const data = await res.json()
  const blocks: string[] = Array.isArray(data?.charts) ? data.charts : []
  if (!blocks.length) throw new Error('No mermaid blocks found')
  return blocks
}

export async function POST(req: NextRequest) {
  getLucidConfig() // validate env exists
  const token = await getAccessTokenFromCookies(req)
  if (!token) return NextResponse.json({ error: 'Lucid not connected' }, { status: 401 })

  const { slug, title } = await req.json().catch(() => ({ slug: '', title: '' }))
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const originFromNext = (req as any).nextUrl?.origin as string | undefined
  const originFromHeaders = `${req.headers.get('x-forwarded-proto') || 'https'}://${req.headers.get('host')}`
  const baseUrl = originFromNext || originFromHeaders
  const mermaidBlocks = await loadMermaidBlocks(baseUrl, slug)
  const si = mermaidToStandardImport(mermaidBlocks)

  const zip = new JSZip()
  zip.file('document.json', JSON.stringify(si.document, null, 2))
  const lucidBuffer = await zip.generateAsync({ type: 'nodebuffer' })

  const form = new FormData()
  const file = new Blob([lucidBuffer], { type: 'x-application/vnd.lucid.standardImport' })
  form.append('file', file, 'import.lucid')
  form.append('product', 'lucidchart')
  if (title) form.append('title', String(title))

  const resLucid = await fetch('https://api.lucid.co/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Lucid-Api-Version': '1',
    },
    body: form,
  })
  if (!resLucid.ok) {
    const text = await resLucid.text()
    return NextResponse.json({ error: 'Lucid import failed', detail: text }, { status: 502 })
  }
  const json = await resLucid.json()
  const docId = json?.id
  const openUrl = docId ? `https://lucid.app/documents/${docId}` : undefined
  return NextResponse.json({ success: true, document: json, openUrl })
}



