import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'login') {
    // Generate the OAuth URL server-side
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    
    const successUrl = `${request.nextUrl.origin}/api/auth/google?action=callback`;
    const failureUrl = `${request.nextUrl.origin}/login?error=oauth_failed`;
    
    const oauthUrl = `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
    
    return NextResponse.redirect(oauthUrl);
  }
  
  if (action === 'callback') {
    // Handle the OAuth callback
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');
    
    if (userId && secret) {
      // Set cookies and redirect to dashboard
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      response.cookies.set('appwrite-userId', userId, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/'
      });
      response.cookies.set('appwrite-secret', secret, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/'
      });
      return response;
    }
    
    return NextResponse.redirect(new URL('/login?error=no_credentials', request.url));
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
