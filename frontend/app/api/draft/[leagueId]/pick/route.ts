import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.leagueId;
    const body = await request.json();
    const { playerId, pick } = body;
    
    // Validate request
    if (!playerId || !pick) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId and pick' },
        { status: 400 }
      );
    }
    
    // For now, just return success
    // In production, this would:
    // 1. Validate the pick is valid
    // 2. Update the draft state in Appwrite
    // 3. Add player to user's fantasy team
    // 4. Move to next pick
    // 5. Send real-time updates to other users
    
    const draftPick = {
      leagueId: leagueId,
      pickNumber: pick,
      playerId: playerId,
      userId: 'user1', // Would be the actual user making the pick
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    console.log('Draft pick recorded:', draftPick);
    
    return NextResponse.json({
      success: true,
      message: 'Player drafted successfully',
      pick: draftPick
    });
    
  } catch (error) {
    console.error('Error processing draft pick:', error);
    return NextResponse.json(
      { error: 'Failed to process draft pick' },
      { status: 500 }
    );
  }
} 