import { NextRequest } from 'next/server'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const searchParams = url.search ? url.search : ''
  // Proxy to unified public search endpoint and force type=leagues
  const hasQuery = Boolean(searchParams && searchParams.length > 1)
  const upstream = `${url.origin}/api/search${searchParams}${hasQuery ? '&' : '?'}type=leagues`
  const res = await fetch(upstream, { cache: 'no-store' })
  const data = await res.json().catch(() => ({ success: false }))
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'content-type': 'application/json' } })
}
