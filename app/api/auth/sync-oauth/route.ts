import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jwt } = body;

    if (!jwt) {
      return NextResponse.json(
        { success: false, error: 'Missing JWT' },
        { status: 400 }
      );
    }
    
    // Set session cookies for the OAuth user
    const cookieStore = cookies();
    
    // Set Appwrite session cookie (value must be session secret)
    cookieStore.set('appwrite-jwt', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    // Also set userId for convenience
    // plain userId cookie not required
    
    return NextResponse.json({ 
      success: true,
      message: 'Session synced successfully'
    });
  } catch (error) {
    console.error('OAuth sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync session' },
      { status: 500 }
    );
  }
}