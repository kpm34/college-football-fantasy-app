import { NextRequest } from 'next/server'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  // Use user's leagues endpoint as a roster-oriented summary for now
  const upstream = `${url.origin}/api/leagues/my-leagues${url.search || ''}`
  const res = await fetch(upstream, { cache: 'no-store', headers: { cookie: request.headers.get('cookie') || '' } })
  const data = await res.json().catch(() => ({ leagues: [] }))
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'content-type': 'application/json' } })
}
