import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/appwrite-session';

export async function GET(request: NextRequest) {
  try {
    // Log all cookies for debugging
    const allCookies = request.cookies.getAll();
    console.log('Available cookies in /api/auth/check:', allCookies.map(c => ({ name: c.name, length: c.value.length })));
    
    // Use the session-based auth check
    const authResult = await checkAuth(request);
    
    if (authResult.authenticated) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: authResult.user
      });
    }
    
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: authResult.error || 'No active session',
      debug: {
        cookieCount: allCookies.length,
        cookieNames: allCookies.map(c => c.name)
      }
    }, { status: 401 });
    
  } catch (error: any) {
    console.error('Auth check error:', error);
    
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Failed to check authentication',
      details: error?.message
    }, { status: 500 });
  }
}