import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID, Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = await userRes.json();
    
    // Parse request body
    const { leagueId, password, teamName, inviteCode } = await request.json();
    
    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }
    
    // Get league details
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );
    
    // Check if league is full
    const currentTeams = league.currentTeams || (league.members?.length || 0);
    if (currentTeams >= league.maxTeams) {
      return NextResponse.json({ error: 'League is full' }, { status: 400 });
    }
    
    // Check if user is already in the league
    const existingRosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [
        Query.equal('leagueId', leagueId),
        Query.equal('userId', user.$id)
      ]
    );
    
    if (existingRosters.documents.length > 0) {
      return NextResponse.json({ error: 'You are already in this league' }, { status: 400 });
    }
    
    // Verify password or invite code
    const isPrivate = league.isPrivate || league.password;
    
    if (isPrivate) {
      // Check invite code first
      if (inviteCode && league.inviteCode && inviteCode === league.inviteCode) {
        // Valid invite code, proceed
      } else if (password && league.password && password === league.password) {
        // Valid password, proceed
      } else {
        return NextResponse.json({ error: 'Invalid password or invite code' }, { status: 403 });
      }
    }
    
    // Create roster for the user
    const rosterData = {
      teamName: teamName || `${user.name || user.email}'s Team`,
      userId: user.$id,
      userName: user.name || user.email,
      email: user.email,
      leagueId: leagueId,
      draftPosition: currentTeams + 1,
      abbreviation: (teamName || user.name || 'TEAM').substring(0, 3).toUpperCase(),
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      players: '[]',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const roster = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      ID.unique(),
      rosterData
    );
    
    // Update league members and team count
    const updatedMembers = [...(league.members || []), user.$id];
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      {
        members: updatedMembers,
        currentTeams: currentTeams + 1
      }
    );
    
    // Log activity
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ACTIVITY_LOG,
        ID.unique(),
        {
          type: 'league_join',
          userId: user.$id,
          leagueId: leagueId,
          teamId: roster.$id,
          description: `${user.name || user.email} joined ${league.name}`,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      // Activity log is optional, don't fail if it doesn't work
      console.error('Failed to log activity:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully joined league',
      rosterId: roster.$id,
      leagueId: leagueId
    });
    
  } catch (error: any) {
    console.error('Join league error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join league' },
      { status: 500 }
    );
  }
}
