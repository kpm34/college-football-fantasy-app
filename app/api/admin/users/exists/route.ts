import { NextRequest, NextResponse } from 'next/server';
import { serverUsers as users } from '@/lib/appwrite-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Require admin session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    if (!userRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const currentUser = await userRes.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((currentUser.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const email = request.nextUrl.searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'email is required' }, { status: 400 });

    const all = await users.list();
    const match = (all.users || []).find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());

    return NextResponse.json({ exists: Boolean(match), id: match?.$id || match?.id || null });
  } catch (error: any) {
    console.error('Admin users exists error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


