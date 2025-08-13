import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId } = body;
    
    if (!sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing session data' },
        { status: 400 }
      );
    }
    
    // Set session cookies
    const cookieStore = cookies();
    
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    cookieStore.set('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OAuth sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync OAuth session' },
      { status: 500 }
    );
  }
}
