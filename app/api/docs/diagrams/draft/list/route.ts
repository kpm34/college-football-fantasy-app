import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'

function classifyGroup(file: string): 'Flows' | 'Operations' | 'Endpoints' | 'Timing' {
  const f = file.toLowerCase()
  if (f.includes('timing') || f.includes('comparison')) return 'Timing'
  if (f.includes('api')) return 'Endpoints'
  if (f.includes('autopick') || f.includes('database') || f.includes('board')) return 'Operations'
  return 'Flows'
}

function toTitle(file: string): string {
  const base = file.replace(/\.drawio$/i, '').replace(/[-_]/g, ' ')
  return base
    .split(' ')
    .map(s => (s.length ? s[0].toUpperCase() + s.slice(1) : s))
    .join(' ')
}

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'docs', 'diagrams', 'draft-diagrams')
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
    const supported = files
      .filter(f => f.toLowerCase().endsWith('.drawio') || f.toLowerCase().endsWith('.md'))
      .sort()
    const items = supported.map(f => ({
      file: `diagrams/draft-diagrams/${f}`,
      title: toTitle(f.replace(/\.(md|drawio)$/i, '')),
      group: classifyGroup(f),
    }))
    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Failed to list diagrams' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
