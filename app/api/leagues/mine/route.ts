import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ success: true, leagues: [] });
    }

    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
    });
    if (!meRes.ok) {
      return NextResponse.json({ success: true, leagues: [] });
    }
    const me = await meRes.json();
    const userId: string = me.$id;
    const email: string = (me.email || '').toLowerCase();
    const name: string = me.name || '';

    // Gather rosters by user identifiers (union of results)
    const rosterDocs: any[] = [];
    const pushDocs = (arr: any) => { if (arr && Array.isArray(arr.documents)) rosterDocs.push(...arr.documents); };

    try {
      const rByUser = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('userId', userId)]
      );
      pushDocs(rByUser);
    } catch {}
    try {
      if (email) {
        const rByEmail = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ROSTERS,
          [Query.equal('email', email)]
        );
        pushDocs(rByEmail);
      }
    } catch {}
    try {
      if (name) {
        const rByName = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ROSTERS,
          [Query.equal('userName', name)]
        );
        pushDocs(rByName);
      }
    } catch {}
    try {
      // Legacy owner field
      const rByOwner = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        [Query.equal('owner', userId)]
      );
      pushDocs(rByOwner);
    } catch {}

    const uniqueLeagueIds = Array.from(new Set(rosterDocs.map((d: any) => d.leagueId).filter(Boolean)));
    if (uniqueLeagueIds.length === 0) {
      return NextResponse.json({ success: true, leagues: [] });
    }

    const leagues = await Promise.all(uniqueLeagueIds.map(async (lid: string) => {
      try {
        const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, lid);
        const commissionerCandidates = [league.commissionerId, league.commissioner, league.commissionerEmail].filter(Boolean);
        const userCandidates = [userId, email, name].filter(Boolean);
        const isCommissioner = commissionerCandidates.some((val: string) => (userCandidates as string[]).includes(val));
        return { id: lid, name: (league as any).name || 'League', isCommissioner };
      } catch {
        return null;
      }
    }));

    return NextResponse.json({ success: true, leagues: leagues.filter(Boolean) });
  } catch (error: any) {
    console.error('Error loading my leagues:', error);
    return NextResponse.json({ success: false, error: error.message || 'failed' }, { status: 500 });
  }
}


