import { NextRequest } from 'next/server'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const searchParams = url.search ? url.search : ''
  const upstream = `${url.origin}/api/leagues/search${searchParams}`
  const res = await fetch(upstream, { cache: 'no-store' })
  const data = await res.json().catch(() => ({ success: false }))
  return new Response(JSON.stringify(data), { status: res.status, headers: { 'content-type': 'application/json' } })
}
