import { NextRequest, NextResponse } from 'next/server'

const LUCID_AUTH_URL = 'https://api.lucid.co/oauth2/authorize'

const DEFAULT_SCOPES = [
  'user.read',
  'documents.read',
  'documents.write',
  'documents.export',
  'folders.read',
  'offline_access',
]

export async function GET(req: NextRequest) {
  const clientId = process.env.LUCID_CLIENT_ID
  const redirectUri = process.env.LUCID_REDIRECT_URI
  const scopeParam = DEFAULT_SCOPES.join(' ').trim()

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Missing LUCID_CLIENT_ID or LUCID_REDIRECT_URI env vars',
      },
      { status: 500 }
    )
  }

  const state = Math.random().toString(36).slice(2)

  const url = new URL(LUCID_AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scopeParam)
  url.searchParams.set('state', state)

  return NextResponse.redirect(url.toString(), { status: 302 })
}
