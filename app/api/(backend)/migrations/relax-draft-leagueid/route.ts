import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases, DATABASE_ID } from '@lib/appwrite-server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const provided = url.searchParams.get('secret') || request.headers.get('x-cron-secret') || ''
    const expected = process.env.CRON_SECRET || ''
    if (!expected || provided !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1) Inspect current attribute
    let attr: any
    try {
      attr = await databases.getAttribute(DATABASE_ID, 'drafts', 'leagueId')
    } catch (e: any) {
      return NextResponse.json({ error: 'Attribute not found on drafts.leagueId', details: e?.message }, { status: 404 })
    }

    if (attr && attr.required === false) {
      return NextResponse.json({ success: true, message: 'leagueId already optional' })
    }

    const endpoint = (process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').trim()
    const project = (process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '').trim()
    const apiKey = (process.env.APPWRITE_API_KEY || '').trim()
    if (!endpoint || !project || !apiKey) {
      return NextResponse.json({ error: 'Missing Appwrite env' }, { status: 500 })
    }

    // 2) Update attribute via REST (SDK lacks required-flag toggle in some versions)
    const patchUrl = `${endpoint}/databases/${DATABASE_ID}/collections/drafts/attributes/string/leagueId`
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': project,
        'X-Appwrite-Key': apiKey,
        'X-Appwrite-Response-Format': '1.4.0'
      },
      body: JSON.stringify({ required: false })
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Failed to update attribute', status: res.status, body: text }, { status: 500 })
    }

    const updated = await res.json()
    return NextResponse.json({ success: true, updated })
  } catch (error: any) {
    return NextResponse.json({ error: 'Migration failed', details: error?.message || String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Convenience: allow GET with secret for manual runs
  return POST(request)
}


