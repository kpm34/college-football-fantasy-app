import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, secret, userId } = await request.json();
    
    console.log('Sync session - Received:', { sessionId, userId, secretLength: secret?.length });
    
    if (!secret) {
      return NextResponse.json(
        { error: 'Session secret is required' },
        { status: 400 }
      );
    }
    
    const cookieStore = await cookies();
    
    // Set the session cookie that our API routes expect
    cookieStore.set('appwrite-session', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Important for OAuth flow
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    // Also set the standard Appwrite session cookie format
    cookieStore.set('a_session_college-football-fantasy-app', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    console.log('Sync session - Cookies set successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Session synced successfully',
      userId
    });
  } catch (error) {
    console.error('Sync session error:', error);
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500 }
    );
  }
}