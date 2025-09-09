import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const clientId = process.env.LUCID_CLIENT_ID;
  const redirectUri = process.env.LUCID_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: 'Lucid OAuth not configured' },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();
  
  // Store state in cookie for verification
  const cookieStore = await cookies();
  cookieStore.set('lucid_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
  });

  // Construct OAuth authorization URL
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'lucidchart.document.content lucidchart.document.export user.profile',
    state,
  });

  const authUrl = `https://lucid.app/oauth2/authorize?${params.toString()}`;

  // Redirect to Lucid OAuth
  return NextResponse.redirect(authUrl);
}