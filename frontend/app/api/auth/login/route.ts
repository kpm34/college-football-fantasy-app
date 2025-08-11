import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Direct server-side authentication that bypasses CORS completely
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Make a direct server-to-server request to Appwrite
    const response = await fetch('https://nyc.cloud.appwrite.io/v1/account/sessions/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const session = await response.json();
    
    // Create a response with the session data
    const res = NextResponse.json(session);
    
    // Extract and set the session cookie from Appwrite's response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      // Parse Appwrite's session cookie
      const sessionMatch = setCookieHeader.match(/a_session_[^=]+=([^;]+)/);
      if (sessionMatch) {
        // Set our own httpOnly cookie for session management
        res.cookies.set('appwrite-session', sessionMatch[1], {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
    }
    
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: error },
      { status: 500 }
    );
  }
}
