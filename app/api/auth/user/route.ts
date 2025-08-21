import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const jwt = request.cookies.get('appwrite-jwt')?.value;
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    
    if (!sessionCookie && !jwt) {
      const response = NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }
    
    const headers: any = {
      'X-Appwrite-Project': 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0'
    };
    if (sessionCookie) {
      headers['Cookie'] = `a_session_college-football-fantasy-app=${sessionCookie}`;
    } else if (jwt) {
      headers['X-Appwrite-JWT'] = jwt;
    }

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
