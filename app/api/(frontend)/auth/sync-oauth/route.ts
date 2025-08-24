import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jwt, secret: rawSecret } = body;

    // Path A: modern flow – we receive a JWT, exchange it for a secret
    let secret = rawSecret as string | undefined;

    if (jwt) {
      const jwtResp = await fetch('https://nyc.cloud.appwrite.io/v1/account/sessions/jwt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0'
        },
        body: JSON.stringify({ jwt })
      });

      if (!jwtResp.ok) {
        const err = await jwtResp.text();
        console.error('JWT exchange failed', err);
        return NextResponse.json({ success: false, error: 'jwt_exchange_failed' }, { status: 500 });
      }

      const { secret: s } = await jwtResp.json();
      secret = s;
    }

    if (!secret) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    // The secret identifies the session; set cookie directly
    const proxyResponse = NextResponse.json({ success: true });
    proxyResponse.cookies.set('appwrite-session', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return proxyResponse;
  } catch (error) {
    console.error('OAuth sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync session' }, { status: 500 });
  }
}