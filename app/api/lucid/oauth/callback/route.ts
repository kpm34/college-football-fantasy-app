import { NextRequest, NextResponse } from 'next/server'

const TOKEN_URL = 'https://api.lucid.co/oauth2/token'

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const clientId = process.env.LUCID_CLIENT_ID || ''
  const clientSecret = process.env.LUCID_CLIENT_SECRET || ''

  const body = new URLSearchParams()
  body.set('grant_type', 'authorization_code')
  body.set('code', code)
  body.set('client_id', clientId)
  body.set('client_secret', clientSecret)
  body.set('redirect_uri', redirectUri)

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Token exchange failed: ${res.status} ${err}`)
  }
  return res.json() as Promise<{
    access_token: string
    refresh_token?: string
    expires_in?: number
    token_type?: string
  }>
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const redirectUri = process.env.LUCID_REDIRECT_URI || ''

  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 })
  }
  if (!code) {
    return NextResponse.json({ ok: false, error: 'Missing code' }, { status: 400 })
  }
  if (!redirectUri) {
    return NextResponse.json({ ok: false, error: 'Missing LUCID_REDIRECT_URI' }, { status: 500 })
  }

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri)
    // TODO: store tokens securely server-side (Appwrite or encrypted KV)
    // For now, just show a success page response with masked token preview.
    const preview =
      (tokens.access_token || '').slice(0, 6) + '…' + (tokens.access_token || '').slice(-4)
    return NextResponse.json({ ok: true, preview, hasRefresh: !!tokens.refresh_token })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Exchange failed' }, { status: 500 })
  }
}
