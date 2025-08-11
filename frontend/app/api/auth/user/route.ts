import { NextRequest, NextResponse } from 'next/server';

// Get current user using the session cookie
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('appwrite-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Create the Appwrite session cookie format
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionId}`;
    
    const response = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const user = await response.json();
    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user', details: error },
      { status: 500 }
    );
  }
}
