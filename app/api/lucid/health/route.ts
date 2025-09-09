import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.LUCID_CLIENT_ID
  const redirectUri = process.env.LUCID_REDIRECT_URI
  const ok = !!clientId && !!redirectUri

  const authUrl =
    clientId && redirectUri
      ? `https://api.lucid.co/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent('user.read documents.read documents.write documents.export folders.read offline_access')}`
      : null

  return NextResponse.json({
    ok,
    hasClientId: !!clientId,
    hasRedirectUri: !!redirectUri,
    authorizeExample: authUrl,
  })
}
