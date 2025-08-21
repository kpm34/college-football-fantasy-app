import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body: unknown = null
    if (contentType.includes('application/csp-report')) {
      // Older UAs send { "csp-report": { ... } }
      body = await request.json().catch(() => null)
    } else if (contentType.includes('application/json')) {
      body = await request.json().catch(() => null)
    } else {
      // Try anyway
      body = await request.json().catch(() => null)
    }

    // Best-effort log to server console (visible in Vercel logs)
    console.warn('[CSP REPORT]', JSON.stringify({
      ua: request.headers.get('user-agent') || 'unknown',
      url: request.headers.get('referer') || request.nextUrl.href,
      report: body,
    }))

    return new NextResponse(null, { status: 204 })
  } catch {
    return new NextResponse(null, { status: 204 })
  }
}

export const runtime = 'nodejs'


