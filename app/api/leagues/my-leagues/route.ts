import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import { withErrorHandler } from '@/lib/utils/error-handler';

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

  const leagueIds = memberships.documents.map((m: any) => m.league_id).filter(Boolean);
  if (!leagueIds.length) {
    return NextResponse.json({ leagues: [], teams: [] });
  }

  // 2) fetch leagues by ids
  // Robust fetch by IDs with fallback per-id get when strict equality fails
  let leaguesRes: any;
  try {
    if (leagueIds.length === 1) {
      const doc = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'leagues',
        leagueIds[0]
      );
      leaguesRes = { documents: [doc] };
    } else {
      leaguesRes = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'leagues',
        [
          Query.equal('$id', leagueIds as string[]),
          Query.limit(100)
        ]
      );
    }
  } catch (err) {
    const docs = await Promise.all(
      leagueIds.map(async (id: string) => {
        try { return await databases.getDocument(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!, 'leagues', id); }
        catch { return null; }
      })
    );
    leaguesRes = { documents: docs.filter(Boolean) };
  }

  // TODO: fetch teams if needed later
  return NextResponse.json({
    leagues: leaguesRes.documents,
    teams: []
  });
});