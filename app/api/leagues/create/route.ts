import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const sessionId = request.cookies.get('appwrite-session')?.value;
    if (!sessionId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user info
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionId}`;
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
    const leagueData = await request.json();

    // Generate invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create league document
    const league = {
      name: leagueData.leagueName,
      commissioner: user.name || user.email,
      commissionerId: user.$id,
      season: new Date().getFullYear(),
      scoringType: leagueData.scoringType || 'PPR',
      maxTeams: leagueData.maxTeams || 12,
      seasonStartWeek: leagueData.seasonStartWeek || 1,
      teams: 1, // Commissioner's team
      draftDate: leagueData.draftDate,
      status: 'pre-draft',
      inviteCode,
      gameMode: leagueData.gameMode,
      selectedConference: leagueData.selectedConference,
      isPrivate: leagueData.isPrivate || false,
      password: leagueData.password || null,
      rosterSchema: {
        rb: Math.min(Number(leagueData.rosterRB || 2), leagueData.gameMode === 'CONFERENCE' ? 2 : 6),
        wr: Math.min(Number(leagueData.rosterWR || (leagueData.gameMode === 'CONFERENCE' ? 3 : 4)), leagueData.gameMode === 'CONFERENCE' ? 5 : 6),
        benchSize: Number(leagueData.benchSize || 5)
      },
      createdAt: new Date().toISOString(),
    };

    // Create league using server-side privileges
    const createdLeague = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      'unique()',
      {
        ...league,
        members: [user.$id],
      }
    );

    // Create commissioner's team
    const teamData = {
      name: `${user.name || user.email}'s Team`,
      owner: user.name || user.email,
      userId: user.$id,
      leagueId: createdLeague.$id,
      record: '0-0',
      pointsFor: 0,
      pointsAgainst: 0,
      players: [],
      createdAt: new Date().toISOString(),
    };

    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TEAMS,
        'unique()',
        teamData
      );
    } catch (e) {
      console.error('Failed to create team', e);
    }

    return NextResponse.json({
      success: true,
      league: createdLeague,
    });
  } catch (error) {
    console.error('League creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create league', details: error },
      { status: 500 }
    );
  }
}