import { NextRequest, NextResponse } from 'next/server';

// Direct OAuth callback handler that bypasses client-side rendering
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');
  const error = searchParams.get('error');
  
  console.log('OAuth callback received:', { userId: userId ? 'present' : 'missing', secret: secret ? 'present' : 'missing', error });
  
  // If error, redirect to login with error
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  }
  
  // If we have userId and secret from token flow
  if (userId && secret) {
    try {
      // Create session by setting cookie directly
      const dashboardUrl = new URL('/dashboard', request.url);
      const response = NextResponse.redirect(dashboardUrl);
      
      // Set the Appwrite session cookie
      response.cookies.set('appwrite-session', secret, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      
      console.log('OAuth session cookie set, redirecting to dashboard');
      return response;
    } catch (err) {
      console.error('OAuth callback error:', err);
      return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }
  }
  
  // No credentials provided
  console.error('OAuth callback missing credentials');
  return NextResponse.redirect(new URL('/login?error=oauth_no_credentials', request.url));
}