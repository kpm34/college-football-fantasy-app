import { NextRequest, NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-generated';

/**
 * Sync league members array with actual rosters in database
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    const { leagueId } = params;

    // Get all rosters for this league
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USER_TEAMS,
      [Query.equal('leagueId', leagueId), Query.limit(100)]
    );

    // Extract user IDs from rosters
    const memberIds = rosters.documents.map((roster: any) => roster.userId);
    const currentTeams = memberIds.length;

    console.log(`Syncing league ${leagueId}: Found ${currentTeams} rosters`);
    console.log('Member IDs:', memberIds);

    // Update league with correct member data
    const updatedLeague = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      {
        members: memberIds,
        currentTeams: currentTeams
      }
    );

    return NextResponse.json({
      success: true,
      message: `Synced ${currentTeams} members`,
      before: {
        members: updatedLeague.members?.length || 0
      },
      after: {
        members: currentTeams,
        memberIds: memberIds
      }
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