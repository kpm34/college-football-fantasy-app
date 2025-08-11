import { NextRequest, NextResponse } from 'next/server';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';

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
    
    // Forward the request to Appwrite
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
        // Forward any session cookies
        ...(request.headers.get('x-appwrite-session') && {
          'X-Appwrite-Session': request.headers.get('x-appwrite-session')!
        })
      },
      body: JSON.stringify(body),
      credentials: 'include'
    });

    const data = await response.json();
    
    // Create response with Appwrite data
    const proxyResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any Set-Cookie headers from Appwrite
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      proxyResponse.headers.set('set-cookie', setCookieHeaders);
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
    
    // Forward the request to Appwrite
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
        // Forward any session cookies
        ...(request.headers.get('x-appwrite-session') && {
          'X-Appwrite-Session': request.headers.get('x-appwrite-session')!
        })
      },
      credentials: 'include'
    });

    const data = await response.json();
    
    // Create response with Appwrite data
    const proxyResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any Set-Cookie headers from Appwrite
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      proxyResponse.headers.set('set-cookie', setCookieHeaders);
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
    
    // Forward the request to Appwrite
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
        // Forward any session cookies
        ...(request.headers.get('x-appwrite-session') && {
          'X-Appwrite-Session': request.headers.get('x-appwrite-session')!
        })
      },
      credentials: 'include'
    });

    const data = await response.json();
    
    // Create response with Appwrite data
    const proxyResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any Set-Cookie headers from Appwrite
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      proxyResponse.headers.set('set-cookie', setCookieHeaders);
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
