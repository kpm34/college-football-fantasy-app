import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Clear all auth-related cookies
    const cookiesToClear = [
      'appwrite-session',
      'a_session_college-football-fantasy-app',
      'a_session_college-football-fantasy-app_legacy'
    ];
    
    // Also clear any cookies that start with a_session_
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.startsWith('a_session_') || 
          cookie.name.includes('appwrite') || 
          cookie.name.includes('session')) {
        cookieStore.delete(cookie.name);
      }
    }
    
    // Explicitly clear the main session cookies
    for (const cookieName of cookiesToClear) {
      cookieStore.delete(cookieName);
    }
    
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}