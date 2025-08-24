import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, serverUsers, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;
    if (!leagueId) {
      return NextResponse.json({ error: 'leagueId required' }, { status: 400 });
    }

    // Load league
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Load all teams/rosters in this league
    const rostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('leagueId', leagueId)]
    );

    // Resolve display names via Appwrite Auth Users to avoid relying on deprecated users collection
    const uniqueUserIds = Array.from(new Set((rostersResponse.documents || []).map((d: any) => d.client_id || d.owner).filter(Boolean)));
    const idToName = new Map<string, string>();
    await Promise.all(uniqueUserIds.map(async (uid) => {
      try {
        const u: any = await serverUsers.get(uid as string);
        idToName.set(uid as string, u.name || u.email || 'Unknown');
      } catch {
        idToName.set(uid as string, 'Unknown');
      }
    }));

    const teams = rostersResponse.documents.map((r: any) => {
      const ownerId = r.client_id || r.owner || '';
      const managerName = idToName.get(ownerId) || r.userName || 'Unknown';
      return {
        $id: r.$id,
        leagueId: r.leagueId,
        userId: ownerId,
        name: r.teamName || r.name || 'Team',
        userName: managerName,
        email: r.email,
        wins: r.wins ?? 0,
        losses: r.losses ?? 0,
        ties: r.ties ?? 0,
        points: r.points ?? r.pointsFor ?? 0,
        pointsFor: r.pointsFor ?? r.points ?? 0,
        pointsAgainst: r.pointsAgainst ?? 0,
        players: r.players
      };
    });

    // Check if user is authenticated to get their team
    let userTeam = null;
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (sessionCookie) {
      const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
      const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
        headers: {
          'X-Appwrite-Project': 'college-football-fantasy-app',
          'X-Appwrite-Response-Format': '1.4.0',
          'Cookie': cookieHeader,
        },
      });
      
      if (userRes.ok) {
        const user = await userRes.json();
        userTeam = teams.find((t: any) => t.client_id === user.$id);
      }
    }

    return NextResponse.json({
      success: true,
      league: {
        id: league.$id,
        name: league.name,
        commissioner: league.commissioner,
        status: league.status,
        maxTeams: league.maxTeams,
        currentTeams: teams.length
      },
      teams,
      userTeam
    });

  } catch (error: any) {
    console.error('Error loading league teams:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load league teams' },
      { status: 500 }
    );
  }
}
