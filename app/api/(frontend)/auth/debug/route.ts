import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
  // Get all cookies
  const allCookies = request.cookies.getAll();
  
  // Get all headers
  const headersList = headers();
  const cookieHeader = headersList.get('cookie');
  
  // Check for Appwrite session directly in cookie header
  const hasAppwriteSession = cookieHeader?.includes('a_session') || false;
  
  // Try to make a direct request to Appwrite with the cookie header
  let appwriteUser = null;
  if (cookieHeader) {
    try {
      const response = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
        headers: {
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader
        }
      });
      
      if (response.ok) {
        appwriteUser = await response.json();
      }
    } catch (e) {
      console.error('Appwrite request failed:', e);
    }
  }
  
  return NextResponse.json({
    debug: {
      cookieCount: allCookies.length,
      cookies: allCookies.map(c => ({
        name: c.name,
        valueLength: c.value.length,
        value: c.value.substring(0, 20) + '...'
      })),
      rawCookieHeader: cookieHeader ? cookieHeader.substring(0, 200) + '...' : null,
      hasAppwriteSessionInHeader: hasAppwriteSession,
      appwriteUser: appwriteUser ? {
        id: appwriteUser.$id,
        email: appwriteUser.email,
        name: appwriteUser.name
      } : null
    }
  });
}