// app/api/mock-draft/turn/[id]/route.ts
import { NextResponse } from 'next/server';
import { autopickIfExpired, autopickBotIfOnClock, getTurn } from '@/lib/draft/engine';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const draftId = params.id;
    
    // If clock expired for a human, autopick; if a bot is on the clock, pick immediately
    await autopickIfExpired(draftId);
    await autopickBotIfOnClock(draftId);
    
    // Get the current turn (does not reset deadlines)
    const turn = await getTurn(draftId);
    
    return NextResponse.json({ 
      ok: true, 
      turn, 
      serverNow: new Date().toISOString() 
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message }, 
      { status: e.status || 500 }
    );
  }
}

