import { Client, Account, Databases } from 'appwrite';
import { NextRequest } from 'next/server';

/**
 * Create an Appwrite client using session from cookies
 * This is for server-side API routes that need to act on behalf of the user
 */
export function createSessionClient(request?: NextRequest) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app');

  // If request is provided, try to get session from cookies
  if (request) {
    // Try multiple cookie formats
    const cookies = request.cookies;
    
    // Check for various session cookie formats
    const possibleCookies = [
      'a_session_college-football-fantasy-app',
      'a_session_college-football-fantasy-app_legacy',
      'appwrite-session',
      ...Array.from(cookies.getAll())
        .filter(c => c.name.startsWith('a_session'))
        .map(c => c.name)
    ];
    
    for (const cookieName of possibleCookies) {
      const sessionValue = cookies.get(cookieName)?.value;
      if (sessionValue) {
        console.log(`Found session cookie: ${cookieName}`);
        // Set the session directly on the client
        client.setSession(sessionValue);
        break;
      }
    }
  }

  return {
    client,
    account: new Account(client),
    databases: new Databases(client)
  };
}

/**
 * Check if a user is authenticated using the session client
 */
export async function checkAuth(request: NextRequest) {
  try {
    const { account } = createSessionClient(request);
    const user = await account.get();
    return {
      authenticated: true,
      user: {
        id: user.$id,
        email: user.email,
        name: user.name,
        emailVerification: user.emailVerification,
        prefs: user.prefs
      }
    };
  } catch (error: any) {
    console.log('Auth check failed:', error?.message);
    return {
      authenticated: false,
      error: error?.message || 'Not authenticated'
    };
  }
}