import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Test endpoint to verify roster saving functionality
 * Can be used to manually process a draft completion
 */
export async function POST(request: NextRequest) {
  try {
    const { leagueId } = await request.json();

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // Get league info
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    // Get all draft picks
    const picksResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_PICKS,
      [
        Query.equal('leagueId', leagueId),
        Query.limit(1000)
      ]
    );

    // Get all rosters
    const rostersResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [
        Query.equal('leagueId', leagueId),
        Query.limit(100)
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        league: {
          id: league.$id,
          name: league.name,
          status: league.status,
          draftCompletedAt: league.draftCompletedAt
        },
        draft: {
          totalPicks: picksResponse.total,
          picks: picksResponse.documents.map(pick => ({
            pickNumber: pick.pickNumber,
            userId: pick.userId,
            playerName: pick.playerName,
            playerPosition: pick.playerPosition
          }))
        },
        rosters: {
          totalRosters: rostersResponse.total,
          rosters: rostersResponse.documents.map(roster => ({
            teamName: roster.teamName,
            userId: roster.userId,
            playersCount: roster.players ? JSON.parse(roster.players).length : 0,
            hasPlayers: !!roster.players,
            hasDraftResults: !!roster.draftResults
          }))
        }
      }
    });

  } catch (error: any) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to get draft data', details: error.message },
      { status: 500 }
    );
  }
}