import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, secret } = body;

    if (!userId || !secret) {
      return NextResponse.json(
        { success: false, error: 'Missing OAuth credentials' },
        { status: 400 }
      );
    }

    // Store session secret in httpOnly cookie
    const cookieStore = cookies();
    cookieStore.set('appwrite-session', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    cookieStore.set('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OAuth sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync session' }, { status: 500 });
  }
}