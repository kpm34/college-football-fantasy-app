import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.leagueId;
    
    // Try to get real draft data from Appwrite
    try {
      // Get league/draft info
      const league = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        leagueId
      );
      
      // Get draft picks for this league
      const draftPicks = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFT_PICKS || 'draft_picks',
        [
          Query.equal('leagueId', leagueId),
          Query.orderDesc('pickNumber')
        ]
      );
      
      // Calculate current pick
      const currentPick = draftPicks.total + 1;
      const totalPicks = (league.maxTeams || 12) * 5; // 5 players per team
      
      return NextResponse.json({
        leagueId: leagueId,
        currentPick: currentPick,
        totalPicks: totalPicks,
        draftOrder: league.draftOrder || [],
        currentUser: league.draftOrder?.[currentPick % league.draftOrder.length],
        draftedPlayers: draftPicks.documents.map((pick: any) => pick.playerId),
        draftStatus: league.status || 'pre-draft',
        timeRemaining: 60,
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error fetching from Appwrite:', error);
      // Fall back to sample data
    }
    
    // Fallback sample data
    const sampleDraftData = {
      leagueId: leagueId,
      currentPick: 1,
      totalPicks: 60, // 12 teams * 5 players each
      draftOrder: [
        'user1', 'user2', 'user3', 'user4', 'user5', 'user6',
        'user7', 'user8', 'user9', 'user10', 'user11', 'user12'
      ],
      currentUser: 'user1',
      draftedPlayers: [], // Will be populated as draft progresses
      draftStatus: 'in_progress', // 'not_started', 'in_progress', 'completed'
      timeRemaining: 60, // seconds for current pick
      lastUpdated: new Date().toISOString()
    };
    
    return NextResponse.json(sampleDraftData);
    
  } catch (error) {
    console.error('Error fetching draft status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft status' },
      { status: 500 }
    );
  }
} 