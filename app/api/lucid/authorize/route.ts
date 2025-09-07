import { NextRequest, NextResponse } from 'next/server'
import { getLucidConfig } from '@/lib/config/lucid'

export async function GET(_req: NextRequest) {
  const { LUCID_CLIENT_ID, LUCID_REDIRECT_URI } = getLucidConfig()
  const authorizeUrl = new URL('https://api.lucid.co/oauth2/authorize')
  authorizeUrl.searchParams.set('response_type', 'code')
  authorizeUrl.searchParams.set('client_id', LUCID_CLIENT_ID)
  authorizeUrl.searchParams.set('redirect_uri', LUCID_REDIRECT_URI)
  // Minimal set; expand as needed for import/list/etc.
  authorizeUrl.searchParams.set('scope', 'documents:write documents:read')
  // optional: state/PKCE if desired; Lucid requires browser auth
  return NextResponse.redirect(authorizeUrl.toString(), { status: 302 })
}


