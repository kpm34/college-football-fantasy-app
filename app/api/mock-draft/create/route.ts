import { NextRequest, NextResponse } from 'next/server';
import { createDraft } from '@lib/draft/engine';
import { DraftConfig, DEFAULT_POSITION_LIMITS } from '@lib/draft/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate and set defaults
    const {
      draftName = `Mock Draft ${Date.now()}`,
      rounds = 15,
      timerPerPickSec = 0,
      seed,
      participants,
      numTeams = 8
    } = body;
    
    // Input validation
    if (typeof rounds !== 'number' || rounds < 1 || rounds > 25) {
      return NextResponse.json(
        { error: 'Rounds must be a number between 1 and 25' },
        { status: 400 }
      );
    }
    
    if (typeof timerPerPickSec !== 'number' || timerPerPickSec < 0) {
      return NextResponse.json(
        { error: 'Timer per pick must be a non-negative number' },
        { status: 400 }
      );
    }
    
    if (seed && typeof seed !== 'string') {
      return NextResponse.json(
        { error: 'Seed must be a string' },
        { status: 400 }
      );
    }
    
    if (typeof numTeams !== 'number' || numTeams < 2 || numTeams > 24) {
      return NextResponse.json(
        { error: 'Number of teams must be between 2 and 24' },
        { status: 400 }
      );
    }
    
    // Create draft configuration
    const config: DraftConfig = {
      rounds,
      snake: true, // Always snake for mock drafts
      timerPerPickSec,
      positionLimits: DEFAULT_POSITION_LIMITS,
      seed
    };
    
    // Create the mock draft in Appwrite so realtime/turn/results work consistently
    const draftId = await createDraft(draftName, config, participants, numTeams);
    
    const participantType = participants ? 
      `${participants.filter((p: any) => p.userType === 'human').length} human, ${participants.filter((p: any) => p.userType === 'bot').length} bot` : 
      `${numTeams} bot`;
    
    return NextResponse.json({
      success: true,
      draftId,
      message: `Draft "${draftName}" created successfully with ${participantType} participants`
    });
    
  } catch (error: any) {
    console.error('Mock draft creation error:', error);
    const errorMessage = error?.message || 'Unknown error';
    const details = error?.response?.message || error?.response || undefined;
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create mock draft',
        message: errorMessage,
        details,
      },
      { status: 500 }
    );
  }
}