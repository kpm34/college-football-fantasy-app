import { NextRequest } from 'next/server'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  // Prefer summary endpoint if present; fall back to results
  const candidates = [
    `${url.origin}/api/mock-draft/results${url.search || ''}`,
    `${url.origin}/api/draft/players${url.search || ''}`
  ]
  for (const upstream of candidates) {
    const res = await fetch(upstream, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      return new Response(JSON.stringify(data), { status: 200, headers: { 'content-type': 'application/json' } })
    }
  }
  return new Response(JSON.stringify({ ok: true, drafts: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
}
