import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Client, Account, ID } from 'node-appwrite';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const secret = searchParams.get('secret');
    
    console.log('OAuth callback - URL params:', { userId, secret, allParams: Array.from(searchParams.entries()) });
    
    const cookieStore = await cookies();
    
    // Check if we have any Appwrite session cookies
    const allCookies = cookieStore.getAll();
    console.log('OAuth callback - All cookies:', allCookies.map(c => ({ name: c.name, length: c.value.length })));
    
    // Create Appwrite client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app');
    
    // Look for any session cookie that might have been set by Appwrite
    const sessionCookie = allCookies.find(c => 
      c.name.includes('appwrite') || 
      c.name.includes('a_session_') ||
      c.name.includes('session')
    );
    
    if (sessionCookie) {
      console.log(`OAuth callback - Found session cookie: ${sessionCookie.name}`);
      
      // Use the session cookie
      client.setSession(sessionCookie.value);
      const account = new Account(client);
      
      try {
        // Verify the session is valid
        const user = await account.get();
        console.log('OAuth callback - Session valid for user:', user.email);
        
        // Create a standardized session cookie that our API routes expect
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        
        response.cookies.set('appwrite-session', sessionCookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        });
        
        return response;
      } catch (error) {
        console.error('OAuth callback - Session verification failed:', error);
      }
    }
    
    // If we have userId and secret, try to create a session manually
    if (userId && secret) {
      console.log('OAuth callback - Attempting to create session with userId and secret');
      
      const account = new Account(client);
      
      try {
        // Create session using the OAuth2 secret
        const session = await account.createSession(userId, secret);
        console.log('OAuth callback - Session created successfully:', session.$id);
        
        // Create response with redirect
        const response = NextResponse.redirect(new URL('/dashboard', request.url));
        
        // Set the session cookie
        response.cookies.set('appwrite-session', session.secret, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/'
        });
        
        return response;
      } catch (error) {
        console.error('OAuth callback - Failed to create session:', error);
      }
    }
    
    // No session found or created
    console.error('OAuth callback - Unable to establish session');
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}