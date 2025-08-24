import { NextRequest, NextResponse } from 'next/server'

// Temporary forwarder to unified commissioner route.
// Keeps backward compatibility for clients still calling update-settings.
export async function PUT(request: NextRequest, context: { params: { leagueId: string } }) {
  const { leagueId } = context.params
  const url = new URL(request.url)
  url.pathname = `/api/leagues/${leagueId}/commissioner`
  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: { 'content-type': 'application/json', cookie: request.headers.get('cookie') || '' },
    body: await request.text(),
  })
  return new NextResponse(await res.text(), { status: res.status, headers: res.headers })
}
