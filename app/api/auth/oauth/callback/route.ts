import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Client, Account } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');
    
    if (!userId || !secret) {
      return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    }
    
    // Initialize server-side Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
      .setKey(process.env.APPWRITE_API_KEY!);
    
    const account = new Account(client);
    
    try {
      // Create session from OAuth
      const session = await account.createSession(userId, secret);
      
      // Get user details
      const user = await account.get();
      
      // Set session cookies
      const cookieStore = cookies();
      
      cookieStore.set('session', session.$id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      
      cookieStore.set('userId', user.$id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      
      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('OAuth session creation error:', error);
      return NextResponse.redirect(new URL('/login?error=oauth_session_failed', request.url));
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_error', request.url));
  }
}
