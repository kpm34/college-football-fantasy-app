import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Already logged out' });
    }
    
    // The cookie is now the raw session secret
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    
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
      secure: process.env.NODE_ENV === 'production',
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return res;
  }
}
