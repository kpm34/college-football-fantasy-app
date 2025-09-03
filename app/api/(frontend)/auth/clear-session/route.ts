import { NextRequest, NextResponse } from 'next/server';
import { Client, Account } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    // Create a client with the user's session
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app');

    const account = new Account(client);
    
    // Try to delete all sessions (this will clear the current session)
    try {
      await account.deleteSessions();
      console.log('Successfully deleted all Appwrite sessions');
    } catch (err: any) {
      console.log('Could not delete sessions:', err?.message);
      // Continue even if this fails
    }

    // Create response that clears all possible cookies
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cleared' 
    });

    // Clear all possible session cookies
    const cookiesToClear = [
      'appwrite-session',
      'a_session_college-football-fantasy-app',
      'a_session_college-football-fantasy-app_legacy',
      'oauth_success',
      // Also clear any cookie that starts with a_session
      'a_session_cfbfantasy.app',
      'a_session_localhost'
    ];

    // Set all cookies to expire
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: undefined, // Let browser decide
        sameSite: 'lax',
        httpOnly: false
      });
      
      // Also try with specific domains
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: '.cfbfantasy.app',
        sameSite: 'lax',
        httpOnly: false
      });
    });

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
  } catch (error: any) {
    console.error('Clear session error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear session',
        details: error?.message 
      },
      { status: 500 }
    );
  }
}