import { NextRequest, NextResponse } from 'next/server';
import { Client, Account, OAuthProvider } from 'appwrite';
import { cookies } from 'next/headers';

// Since Appwrite OAuth must be initiated client-side, we'll return the proper URL
export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    
    // Success and failure URLs for OAuth callback
    const successUrl = `${origin}/api/auth/oauth/success`;
    const failureUrl = `${origin}/login?error=oauth_failed`;
    
    // Return the OAuth configuration for client-side redirect
    return NextResponse.json({
      success: true,
      provider: OAuthProvider.Google,
      successUrl,
      failureUrl
    });
  } catch (error) {
    console.error('OAuth configuration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to configure OAuth' },
      { status: 500 }
    );
  }
}

// Handle the OAuth callback POST from Appwrite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Appwrite sends userId and secret in the callback
    const { userId, secret } = body;
    
    if (!userId || !secret) {
      return NextResponse.json(
        { success: false, error: 'Missing OAuth credentials' },
        { status: 400 }
      );
    }
    
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1")
      .setProject(process.env.APPWRITE_PROJECT_ID || "college-football-fantasy-app")
      .setKey(process.env.APPWRITE_API_KEY!);
    
    const account = new Account(client);
    
    try {
      // Create session with OAuth credentials
      const session = await account.createSession(userId, secret);
      
      // Set session cookie
      const cookieStore = cookies();
      cookieStore.set('session', session.$id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      
      // Store user ID as well
      cookieStore.set('userId', session.userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });
      
      return NextResponse.json({
        success: true,
        user: {
          $id: session.userId,
          name: session.providerUid
        }
      });
    } catch (error) {
      console.error('OAuth session creation error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { success: false, error: 'OAuth callback failed' },
      { status: 500 }
    );
  }
}
