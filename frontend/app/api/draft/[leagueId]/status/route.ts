import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.leagueId;
    
    // For now, return sample draft data
    // In production, this would fetch from Appwrite
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