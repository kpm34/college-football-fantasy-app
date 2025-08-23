import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
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
    const { leagueId, password, teamName } = await request.json();
    
    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }
    
    // Get league details
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Compute capacity using authoritative roster count (ignore stale league fields)
    const rosterCountPage = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      [Query.equal('leagueId', leagueId), Query.limit(1)]
    );
    const rosterCount = (rosterCountPage as any).total ?? (rosterCountPage.documents?.length || 0);
    const maxTeams = (league as any).maxTeams ?? 12;
    if (rosterCount >= maxTeams) {
      return NextResponse.json({ error: 'League is full' }, { status: 400 });
    }
    
    // Check if user is already in the league
    const existingRosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      [
        Query.equal('leagueId', leagueId),
        Query.equal('userId', user.$id)
      ]
    );
    
    if (existingRosters.documents.length > 0) {
      return NextResponse.json({ error: 'You are already in this league' }, { status: 400 });
    }
    
    // Verify access for private leagues only
    const isPrivate = league.isPublic === false || !!league.password;
    
    if (isPrivate) {
      // Check password for private leagues
      if (password && league.password && password === league.password) {
        // Valid password, proceed
      } else {
        return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
      }
    }
    
    // Create roster for the user (only include attributes that exist in `user_teams`)
    const rosterData: Record<string, any> = {
      teamName: teamName || `${user.name || user.email}'s Team`,
      userId: user.$id,
      leagueId: leagueId,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      players: '[]'
    };

    // Only include fields that exist in the collection
    // Abbreviation is optional and may not exist in schema
    try {
      const rostersCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.USER_TEAMS);
      const hasAbbreviation = Array.isArray((rostersCollection as any).attributes) && (rostersCollection as any).attributes.some((a: any) => a.key === 'abbreviation');
      if (hasAbbreviation) {
        rosterData.abbreviation = (teamName || user.name || 'TEAM').substring(0, 3).toUpperCase();
      }
    } catch {}
    
    const roster = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      ID.unique(),
      rosterData
    );
    
    // Update league members and team count
    // Rebuild members/currentTeams from rosters to keep schema in sync
    const allRosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      [Query.equal('leagueId', leagueId), Query.limit(1000)]
    );
    const updatedMembers = Array.from(new Set((allRosters.documents || []).map((r: any) => r.userId))).filter(Boolean);
    const currentTeams = (allRosters as any).total ?? updatedMembers.length;

    // Only include attributes that actually exist in the leagues collection to avoid
    // Appwrite "Unknown attribute" errors across environments with drifting schemas
    let updatePayload: Record<string, any> = {};
    try {
      const leaguesCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.LEAGUES);
      const attributes: string[] = Array.isArray((leaguesCollection as any).attributes)
        ? (leaguesCollection as any).attributes.map((a: any) => a.key)
        : [];

      if (attributes.includes('members')) {
        updatePayload.members = updatedMembers;
      }
      if (attributes.includes('currentTeams')) {
        updatePayload.currentTeams = currentTeams;
      }
      // Optionally set status to full when we hit capacity, but only if field exists
      const nextTeams = currentTeams; // already authoritative
      if (attributes.includes('status') && typeof maxTeams === 'number') {
        if (nextTeams >= maxTeams) {
          updatePayload.status = 'full';
        } else if (league.status === 'full') {
          updatePayload.status = 'open';
        }
      }
    } catch {
      // If schema lookup fails, fall back to safest minimal update (members only)
      updatePayload = { members: updatedMembers };
    }

    if (Object.keys(updatePayload).length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId,
        updatePayload
      );
    }
    
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
