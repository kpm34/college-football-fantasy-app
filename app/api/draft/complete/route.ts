import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handle draft completion - save drafted players to member rosters
 * This endpoint should be called when a draft status changes to 'complete'
 */
export async function POST(request: NextRequest) {
  try {
    const { leagueId } = await request.json();

    if (!leagueId) {
      return NextResponse.json({ error: 'League ID is required' }, { status: 400 });
    }

    // Verify the league exists and has a completed draft
    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // Get all draft picks for this league
    const picksResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_PICKS,
      [
        Query.equal('leagueId', leagueId),
        // Appwrite schema attribute is 'pick' in draft_picks
        Query.orderAsc('pick'),
        Query.limit(1000) // Ensure we get all picks
      ]
    );

    const picks = picksResponse.documents;
    console.log(`Found ${picks.length} draft picks for league ${leagueId}`);

    if (picks.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No draft picks found to process',
        processed: 0
      });
    }

    // Group picks by userId to build each member's roster
    const rostersByUser: Record<string, any[]> = {};
    for (const pick of picks) {
      if (!rostersByUser[pick.userId]) {
        rostersByUser[pick.userId] = [];
      }
      
      // Add player info to the roster
      rostersByUser[pick.userId].push({
        playerId: pick.playerId,
        playerName: pick.playerName,
        playerPosition: pick.playerPosition,
        playerTeam: pick.playerTeam,
        draftPosition: (pick as any).pickNumber ?? (pick as any).pick,
        round: (pick as any).round,
        draftedAt: pick.timestamp
      });
    }

    let processed = 0;
    let errors = 0;
    const results = [];

    // Update each member's roster with their drafted players
    for (const [userId, draftedPlayers] of Object.entries(rostersByUser)) {
      try {
        // Find the user's roster record
        const rostersResponse = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USER_TEAMS,
          [
            Query.equal('leagueId', leagueId),
            Query.equal('userId', userId),
            Query.limit(1)
          ]
        );

        if (rostersResponse.documents.length === 0) {
          console.warn(`No roster found for user ${userId} in league ${leagueId}`);
          errors++;
          results.push({
            userId,
            status: 'error',
            message: 'No roster found for user'
          });
          continue;
        }

        const roster = rostersResponse.documents[0];
        const playerIds = draftedPlayers.map(p => p.playerId);

        // Update the roster with the drafted players
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USER_TEAMS,
          roster.$id,
          {
            // Store player IDs as JSON string for compatibility with existing system
            players: JSON.stringify(playerIds),
            // Also store full draft results for reference
            draftResults: JSON.stringify(draftedPlayers)
          }
        );

        processed++;
        results.push({
          userId,
          teamName: roster.teamName,
          status: 'success',
          playersCount: draftedPlayers.length,
          players: draftedPlayers.map(p => `${p.playerName} (${p.playerPosition})`)
        });

        console.log(`✅ Updated roster for ${roster.teamName}: ${draftedPlayers.length} players`);

      } catch (error) {
        console.error(`❌ Failed to update roster for user ${userId}:`, error);
        errors++;
        results.push({
          userId,
          status: 'error',
          message: error.message
        });
      }
    }

    // Update league status to 'active' since draft is complete
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId,
        {
          status: 'active',
          draftCompletedAt: new Date().toISOString()
        }
      );
      console.log(`✅ Updated league ${leagueId} status to active`);
    } catch (error) {
      console.error(`⚠️ Failed to update league status:`, error);
    }

    return NextResponse.json({
      success: true,
      message: `Draft completion processed successfully`,
      processed,
      errors,
      totalPicks: picks.length,
      totalTeams: Object.keys(rostersByUser).length,
      results
    });

  } catch (error: any) {
    console.error('Error processing draft completion:', error);
    return NextResponse.json(
      { error: 'Failed to process draft completion', details: error.message },
      { status: 500 }
    );
  }
}