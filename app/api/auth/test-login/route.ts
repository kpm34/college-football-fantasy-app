import { NextRequest, NextResponse } from 'next/server';
import { Account, Client } from 'appwrite';
import { cookies } from 'next/headers';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    const account = new Account(client);
    
    // Create session
    const session = await account.createEmailPasswordSession(email, password);
    
    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('appwrite-session', session.$id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: email
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    
    // If user doesn't exist, create them
    if (error?.code === 401) {
      try {
        const account = new Account(client);
        const user = await account.create('unique()', email, password, email.split('@')[0]);
        const session = await account.createEmailPasswordSession(email, password);
        
        const cookieStore = await cookies();
        cookieStore.set('appwrite-session', session.$id, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7
        });
        
        return NextResponse.json({
          success: true,
          user: {
            id: user.$id,
            email: email
          },
          message: 'Account created and logged in'
        });
      } catch (createError: any) {
        return NextResponse.json({
          success: false,
          error: createError.message
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Login failed'
    }, { status: 401 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to login with email and password'
  });
}
