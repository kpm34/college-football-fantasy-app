// app/api/mock-draft/pick/route.ts
import { NextResponse } from 'next/server';
import { applyPick, getTurn } from '@lib/draft/engine';

export async function POST(req: Request) {
  try {
    const { draftId, participantId, playerId } = await req.json();
    
    if (!draftId || !participantId || !playerId) {
      return NextResponse.json(
        { ok: false, error: 'draftId, participantId, playerId required' }, 
        { status: 400 }
      );
    }
    
    // Apply the pick
    await applyPick(draftId, participantId, playerId);
    
    // Get the next turn
    const turn = await getTurn(draftId);
    
    return NextResponse.json({ 
      ok: true, 
      nextTurn: turn 
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message }, 
      { status: e.status || 500 }
    );
  }
}