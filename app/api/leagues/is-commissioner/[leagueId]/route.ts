import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { isUserCommissioner } from '@/lib/utils/commissioner';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;

    // Resolve current user from session cookie
    const sessionId = request.cookies.get('appwrite-session')?.value;
    // session is optional; if missing we still return JSON with isCommissioner false unless name/email override below

    const cookieHeader = `a_session_college-football-fantasy-app=${sessionId}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        ...(sessionId ? { 'Cookie': cookieHeader } : {} as any),
      },
    });
    let user: any = null;
    if (userRes.ok) {
      user = await userRes.json();
    }

    // Load league (server-side privileged)
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    const isComm = isUserCommissioner(league, user);
    return NextResponse.json({ isCommissioner: isComm });
  } catch (error) {
    console.error('is-commissioner error:', error);
    return NextResponse.json({ isCommissioner: false, error: 'failed' });
  }
}


