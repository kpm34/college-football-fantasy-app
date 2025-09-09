import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.json({
      ok: false,
      error: error,
      description: searchParams.get('error_description'),
    });
  }

  // Verify state for CSRF protection
  const cookieStore = await cookies();
  const storedState = cookieStore.get('lucid_oauth_state')?.value;
  
  if (!state || state !== storedState) {
    return NextResponse.json({
      ok: false,
      error: 'Invalid state parameter',
    });
  }

  // Clear state cookie
  cookieStore.delete('lucid_oauth_state');

  if (!code) {
    return NextResponse.json({
      ok: false,
      error: 'No authorization code received',
    });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.lucid.co/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LUCID_CLIENT_ID!,
        client_secret: process.env.LUCID_CLIENT_SECRET!,
        redirect_uri: process.env.LUCID_REDIRECT_URI!,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return NextResponse.json({
        ok: false,
        error: 'Token exchange failed',
        details: errorData,
      });
    }

    const tokenData = await tokenResponse.json();
    
    // Store token securely (in production, store in database)
    // For now, we'll store in a secure, httpOnly cookie
    cookieStore.set('lucid_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenData.expires_in || 3600,
    });

    if (tokenData.refresh_token) {
      cookieStore.set('lucid_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    // Fetch user profile to confirm connection
    const profileResponse = await fetch('https://api.lucid.co/users/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = profileResponse.ok ? await profileResponse.json() : null;

    return NextResponse.json({
      ok: true,
      preview: {
        user: profile?.email || 'Connected',
        scopes: tokenData.scope,
        expiresIn: tokenData.expires_in,
      },
      hasRefresh: !!tokenData.refresh_token,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({
      ok: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}