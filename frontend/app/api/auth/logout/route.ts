import { NextRequest, NextResponse } from 'next/server';

// Logout by clearing the session
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('appwrite-session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ message: 'Already logged out' });
    }
    
    // Create the Appwrite session cookie format
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionId}`;
    
    // Try to delete the session on Appwrite (optional, can fail)
    await fetch('https://nyc.cloud.appwrite.io/v1/account/sessions/current', {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    // Clear our session cookie regardless
    const res = NextResponse.json({ message: 'Logged out successfully' });
    res.cookies.set('appwrite-session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Delete the cookie
    });
    
    return res;
  } catch (error) {
    // Even if Appwrite fails, clear our cookie
    const res = NextResponse.json({ message: 'Logged out successfully' });
    res.cookies.set('appwrite-session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }
}
