import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

/**
 * Sync league members array with actual rosters in database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;

    // Get the league first to check maxTeams
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Get all rosters for this league
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [Query.equal('leagueId', leagueId), Query.limit(100)]
    );

    // Extract user IDs from rosters (actual count)
    const memberIds = rosters.documents.map((roster: any) => roster.clientId).filter(Boolean);
    const actualTeamCount = rosters.total || rosters.documents.length;
    const maxTeams = (league as any).maxTeams || 12;

    console.log(`Syncing league ${leagueId}: Found ${actualTeamCount} rosters`);
    console.log(`Max teams: ${maxTeams}, Current stored: ${(league as any).currentTeams}`);

    // Determine correct status based on actual count
    const newStatus = actualTeamCount >= maxTeams ? 'full' : 'open';

    // Update league with correct member data and status
    const updatedLeague = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      {
        members: memberIds,
        currentTeams: actualTeamCount,
        status: newStatus
      }
    );

    return NextResponse.json({
      success: true,
      message: `Synced ${actualTeamCount} members, status: ${newStatus}`,
      before: {
        members: (league as any).members?.length || 0,
        currentTeams: (league as any).currentTeams,
        status: (league as any).status
      },
      after: {
        members: actualTeamCount,
        currentTeams: actualTeamCount,
        status: newStatus,
        maxTeams: maxTeams
      },
      wasFixed: (league as any).currentTeams !== actualTeamCount
    });

  } catch (error: any) {
    console.error('Member sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync members',
        message: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}