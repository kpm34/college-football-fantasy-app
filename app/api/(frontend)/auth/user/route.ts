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
    
    // Last resort - try to get session from Appwrite SDK directly
    if (!sessionCookie) {
      // Check if we can get the user directly from Appwrite
      try {
        const { createClient } = await import('@/lib/appwrite-server');
        const { account } = await createClient();
        const user = await account.get();
        
        if (user) {
          // We have a valid session through the SDK
          return NextResponse.json({
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
        }
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
