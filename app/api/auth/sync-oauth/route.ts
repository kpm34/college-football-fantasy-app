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

    // Hit Appwrite to convert secret -> session cookie
    const resp = await fetch('https://nyc.cloud.appwrite.io/v1/account/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0'
      },
      body: JSON.stringify({ userId, secret })
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('Appwrite session create failed', err);
      return NextResponse.json({ success:false, error:'createSession failed' },{status:500});
    }

    const setCookie = resp.headers.get('set-cookie');
    if (!setCookie) {
      return NextResponse.json({ success:false, error:'No cookie from Appwrite'},{status:500});
    }

    // Forward the exact cookie back to the browser so path, domain, expiry etc stay intact
    const proxyResponse = NextResponse.json({ success:true });
    proxyResponse.headers.set('set-cookie', setCookie);
    return proxyResponse;
  } catch (error) {
    console.error('OAuth sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync session' }, { status: 500 });
  }
}