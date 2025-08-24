import { NextRequest } from 'next/server'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // Delegate to the edge search handler for fast responses
  const url = new URL(request.url)
  const upstream = `${url.origin}/api/players/search${url.search || ''}`
  const res = await fetch(upstream, { cache: 'no-store', headers: { cookie: request.headers.get('cookie') || '' } })
  const data = await res.json().catch(() => ({ players: [] }))
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'content-type': 'application/json' } })
}
