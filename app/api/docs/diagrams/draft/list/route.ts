import { NextRequest, NextResponse } from 'next/server'
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

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Allow admin session (Appwrite) by email
  try {
    const sessionCookie = request.cookies.get('appwrite-session')?.value
    if (!sessionCookie) return false
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`
    const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    })
    if (!meRes.ok) return false
    const me = await meRes.json()
    const adminEmail = (process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com').toLowerCase()
    return (me.email || '').toLowerCase() === adminEmail
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    const dir = path.join(process.cwd(), 'docs', 'diagrams', 'draft-diagrams')
    const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
    const supported = files
      .filter(f => f.toLowerCase().endsWith('.drawio') || f.toLowerCase().endsWith('.md'))
      .sort()
    const items = supported.map(f => ({
      file: `draft-diagrams/${f}`,
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
