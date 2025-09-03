import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Try multiple possible cookie names
    let sessionCookie = request.cookies.get('appwrite-session')?.value;

    // Fallback to the cookie set directly by Appwrite (a_session_<projectId>)
    if (!sessionCookie) {
      const native = request.cookies.get('a_session_college-football-fantasy-app')?.value;
      if (native) sessionCookie = native;
    }
    
    // Try legacy format
    if (!sessionCookie) {
      const legacy = request.cookies.get('a_session_college-football-fantasy-app_legacy')?.value;
      if (legacy) sessionCookie = legacy;
    }
    
    // Check for any cookie that starts with a_session
    if (!sessionCookie) {
      const allCookies = request.cookies.getAll();
      const sessionCookieEntry = allCookies.find(c => c.name.startsWith('a_session'));
      if (sessionCookieEntry) {
        console.log('Found session cookie with name:', sessionCookieEntry.name);
        sessionCookie = sessionCookieEntry.value;
      }
    }
    
    // Check for our synthetic OAuth session cookie
    if (!sessionCookie) {
      const oauthSession = request.cookies.get('appwrite-session')?.value;
      if (oauthSession) {
        console.log('Found OAuth session cookie:', oauthSession.substring(0, 20));
        sessionCookie = oauthSession;
        
        // If it's a synthetic OAuth session, we need to verify it differently
        if (oauthSession.startsWith('oauth_')) {
          // Parse the OAuth session
          const [, userId, timestamp] = oauthSession.split('_');
          
          // For now, trust the OAuth session if it's recent (within 7 days)
          const age = Date.now() - parseInt(timestamp);
          if (age < 7 * 24 * 60 * 60 * 1000) {
            // Return cached user data from the OAuth session
            // In production, you'd want to store this in a database
            return NextResponse.json({
              success: true,
              data: {
                id: userId,
                $id: userId,
                email: 'oauth.user@cfbfantasy.app', // Placeholder
                name: 'OAuth User',
                emailVerification: true,
                prefs: {}
              }
            });
          }
        }
      }
    }
    
    // Last resort - try to get session from Appwrite SDK directly
    if (!sessionCookie) {
      // Check if we can get the user directly from Appwrite
      try {
        const { getServerClient } = await import('@/lib/appwrite-server');
        const { Users } = await import('node-appwrite');
        const client = getServerClient();
        const users = new Users(client);
        
        // This won't work without a session, but keeping for reference
        console.log('No session found, cannot get user');
      } catch (sdkError) {
        console.log('SDK check failed:', sdkError);
      }
    }
    
    if (!sessionCookie) {
      console.log('No session cookie found. Available cookies:', request.cookies.getAll().map(c => c.name));
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }
    
    const headers: any = {
      'X-Appwrite-Project': 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0'
    };
    headers['Cookie'] = `a_session_college-football-fantasy-app=${sessionCookie}`;

    const response = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const user = await response.json();
    const userResponse = NextResponse.json({
      success: true,
      data: {
        id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
        prefs: user.prefs,
        $id: user.$id
      }
    });
    userResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return userResponse;
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user', details: error },
      { status: 500 }
    );
  }
}
