// app/api/mock-draft/turn/[id]/route.ts
import { NextResponse } from 'next/server';
import { autopickIfExpired, getTurn } from '@/lib/draft/engine';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const draftId = params.id;
    
    // Check for and handle any expired picks
    await autopickIfExpired(draftId);
    
    // Get the current turn
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

