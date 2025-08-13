import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Create user account in Appwrite
    const createResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
      },
      body: JSON.stringify({
        userId: ID.unique(),
        email,
        password,
        name,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      return NextResponse.json(error, { status: createResponse.status });
    }

    const user = await createResponse.json();
    
    // Automatically log them in
    const sessionResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account/sessions/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!sessionResponse.ok) {
      // User created but login failed - still return success
      return NextResponse.json({ user, message: 'Account created. Please log in.' });
    }

    const session = await sessionResponse.json();
    
    // Create response with session cookie
    const res = NextResponse.json({ user, session });
    
    // Extract and set the session cookie
    const setCookieHeader = sessionResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      const sessionMatch = setCookieHeader.match(/a_session_[^=]+=([^;]+)/);
      if (sessionMatch) {
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed', details: error },
      { status: 500 }
    );
  }
}
