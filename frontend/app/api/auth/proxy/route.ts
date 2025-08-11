import { NextRequest, NextResponse } from 'next/server';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const SESSION_COOKIE = 'APPWRITE_SESSION_ID';

// This is a temporary proxy to work around CORS issues
// It forwards requests to Appwrite from the server side
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const path = request.nextUrl.searchParams.get('path') || '';
    
    // Construct the full Appwrite URL
    const url = `${APPWRITE_ENDPOINT}${path}`;
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const origin = request.headers.get('origin') || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const referer = request.headers.get('referer') || origin;
    
    // Forward the request to Appwrite
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
        // Don't forward Origin/Referer - let Node.js set them
        // This ensures Appwrite sees the request as coming from the server
        // 'Origin': origin,
        // 'Referer': referer,
        // Forward any session cookies
        ...(request.headers.get('x-appwrite-session') && {
          'X-Appwrite-Session': request.headers.get('x-appwrite-session')!
        })
      },
      body: JSON.stringify(body),
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();
    
    // Create response with Appwrite data
    const proxyResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any Set-Cookie headers from Appwrite
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      proxyResponse.headers.set('set-cookie', setCookieHeaders);
    }
    // If session creation succeeded, also persist the session id on our domain for subsequent calls
    if (response.ok && path.startsWith('/account/sessions')) {
      const sessionId = (data && (data.$id || data.sessionId)) as string | undefined;
      if (sessionId) {
        proxyResponse.cookies.set(SESSION_COOKIE, sessionId, {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/',
        });
      }
    }
    
    return proxyResponse;
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: 'Authentication proxy failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path') || '';
    
    // Construct the full Appwrite URL
    const url = `${APPWRITE_ENDPOINT}${path}`;
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const origin = request.headers.get('origin') || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const referer = request.headers.get('referer') || origin;
    
    // Forward the request to Appwrite
    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
        // Don't forward Origin/Referer - let Node.js set them
        // 'Origin': origin,
        // 'Referer': referer,
        ...(sessionCookie && { 'X-Appwrite-Session': sessionCookie })
      },
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();
    
    // Create response with Appwrite data
    const proxyResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any Set-Cookie headers from Appwrite
    const setCookieHeaders2 = response.headers.get('set-cookie');
    if (setCookieHeaders2) {
      proxyResponse.headers.set('set-cookie', setCookieHeaders2);
    }
    
    return proxyResponse;
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: 'Authentication proxy failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get('path') || '';
    
    // Construct the full Appwrite URL
    const url = `${APPWRITE_ENDPOINT}${path}`;
    
    // Get cookies from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const origin = request.headers.get('origin') || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const referer = request.headers.get('referer') || origin;
    
    // Forward the request to Appwrite
    const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
        // Don't forward Origin/Referer - let Node.js set them
        // 'Origin': origin,
        // 'Referer': referer,
        ...(sessionCookie && { 'X-Appwrite-Session': sessionCookie })
      },
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();
    
    // Create response with Appwrite data
    const proxyResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any Set-Cookie headers from Appwrite
    const setCookieHeaders3 = response.headers.get('set-cookie');
    if (setCookieHeaders3) {
      proxyResponse.headers.set('set-cookie', setCookieHeaders3);
    }
    // Clear our cookie on logout
    if (path.startsWith('/account/sessions')) {
      proxyResponse.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    }
    
    return proxyResponse;
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: 'Authentication proxy failed' },
      { status: 500 }
    );
  }
}
