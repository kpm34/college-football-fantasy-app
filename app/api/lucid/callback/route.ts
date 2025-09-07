import { NextRequest, NextResponse } from 'next/server'
import { getLucidConfig } from '@/lib/config/lucid'

export async function GET(req: NextRequest) {
  const { LUCID_CLIENT_ID, LUCID_CLIENT_SECRET, LUCID_REDIRECT_URI } = getLucidConfig()
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  const body = new URLSearchParams()
  body.set('grant_type', 'authorization_code')
  body.set('code', code)
  body.set('redirect_uri', LUCID_REDIRECT_URI)
  body.set('client_id', LUCID_CLIENT_ID)
  body.set('client_secret', LUCID_CLIENT_SECRET)

  const tokenRes = await fetch('https://api.lucid.co/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!tokenRes.ok) {
    const text = await tokenRes.text()
    return NextResponse.json({ error: 'Token exchange failed', detail: text }, { status: 502 })
  }
  const tokenJson = await tokenRes.json()

  const expiresAt = Date.now() + Math.max(0, Number(tokenJson?.expires_in || 0)) * 1000
  const res = NextResponse.redirect('/admin/diagrams')
  // Store in HttpOnly cookies for dev; move to secure store later
  res.cookies.set('lucid_access_token', String(tokenJson.access_token || ''), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  res.cookies.set('lucid_refresh_token', String(tokenJson.refresh_token || ''), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  res.cookies.set('lucid_expires_at', String(expiresAt), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return res
}


