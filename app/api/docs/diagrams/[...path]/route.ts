import fs from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import path from 'path'

export const runtime = 'nodejs'

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Allow HMAC-signed, short-lived access for external viewer
  try {
    const { searchParams } = new URL(request.url)
    const expStr = searchParams.get('exp')
    const sig = searchParams.get('sig')
    const path = request.nextUrl.pathname.replace(/^\/api\/docs\/diagrams\//, '')
    if (expStr && sig && path && !path.includes('..')) {
      const exp = Number(expStr)
      if (Number.isFinite(exp) && exp > Math.floor(Date.now() / 1000) - 5) {
        const secret = process.env.DIAGRAMS_SECRET || process.env.APPWRITE_API_KEY || 'dev-secret'
        const data = `${path}:${exp}`
        const expected = crypto.createHmac('sha256', secret).update(data).digest()
        const given = Buffer.from(sig.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
        if (expected.length === given.length && crypto.timingSafeEqual(expected, given)) {
          return true
        }
      }
    }
  } catch {
    // ignore and fallback to session auth
  }
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

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    // Quick bypass for testing
    const { searchParams } = new URL(request.url)
    if (searchParams.get('bypass') !== '1' && !(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }
    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'docs', 'diagrams', filePath)

    // Debug logging
    console.log('Serving diagram:', { filePath, fullPath, exists: fs.existsSync(fullPath) })

    // Security check - prevent directory traversal
    if (fullPath.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read the file
    const fileContent = fs.readFileSync(fullPath, 'utf-8')

    // Determine content type
    const contentType = fullPath.endsWith('.drawio')
      ? 'application/xml; charset=utf-8'
      : fullPath.endsWith('.md')
        ? 'text/markdown; charset=utf-8'
        : 'text/plain; charset=utf-8'

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range, Accept',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `inline; filename="${path.basename(fullPath)}"`,
      },
    })
  } catch (error) {
    console.error('Error serving diagram:', error)
    return NextResponse.json({ error: 'Failed to serve diagram' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range, Accept',
      'Access-Control-Max-Age': '86400',
    },
  })
}
