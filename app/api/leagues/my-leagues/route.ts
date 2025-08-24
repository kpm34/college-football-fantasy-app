import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/server-appwrite';
import { Query } from 'node-appwrite';
import { withErrorHandler } from '@lib/utils/error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Check if user is authenticated
  const sessionCookie = request.cookies.get('appwrite-session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get user info
  const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
  const userResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
    headers: {
      'X-Appwrite-Project': 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0',
      'Cookie': cookieHeader,
    },
  });

  if (!userResponse.ok) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const user = await userResponse.json();
  console.log('[/api/leagues/my-leagues] User authenticated:', user.$id, user.email);

  // --- Direct Appwrite queries -----------------------------------------
  // 1) active memberships for this user
  const memberships = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    'league_memberships',
    [
      Query.equal('client_id', [user.$id]),
      Query.equal('status', ['active']),
      Query.limit(100)
    ]
  );

  const leagueIds = memberships.documents.map(m => m.league_id);
  if (!leagueIds.length) {
    return NextResponse.json({ leagues: [], teams: [] });
  }

  // 2) fetch leagues by ids
  const leaguesRes = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    'leagues',
    [
      Query.equal('$id', leagueIds),
      Query.limit(100)
    ]
  );

  // TODO: fetch teams if needed later
  return NextResponse.json({
    leagues: leaguesRes.documents,
    teams: []
  });
});