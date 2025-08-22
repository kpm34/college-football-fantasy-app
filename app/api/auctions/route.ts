import { NextRequest } from 'next/server'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const upstream = `${url.origin}/api/auctions${url.search || ''}`
  const res = await fetch(upstream, { cache: 'no-store' })
  const data = await res.json().catch(() => ({ auctions: [] }))
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'content-type': 'application/json' } })
}
