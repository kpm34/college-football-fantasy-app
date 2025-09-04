import { NextRequest, NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite-server';

export async function GET(request: NextRequest) {
  try {
    const { account, hasSession } = await createSessionClient();
    
    if (!hasSession) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }
    
    try {
      // Get the current user
      const user = await account.get();
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.$id,
          email: user.email,
          name: user.name,
          emailVerification: user.emailVerification,
          phoneVerification: user.phoneVerification
        }
      });
    } catch (error) {
      console.error('Failed to get user:', error);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    );
  }
}