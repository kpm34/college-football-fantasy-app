// app/api/mock-draft/join/route.ts
import { NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function POST(req: Request) {
  try {
    const { draftId, userId, displayName } = await req.json();
    
    if (!draftId || !userId) {
      return NextResponse.json(
        { ok: false, error: 'draftId and userId required' }, 
        { status: 400 }
      );
    }

    // Get all participants for this draft
    const parts = await serverDatabases.listDocuments(DATABASE_ID, 'mock_draft_participants', [
      Query.equal('draftId', draftId),
      Query.orderAsc('slot'),
      Query.limit(100)
    ]);

    // Check if user is already in the draft
    const already = parts.documents.find(p => p.userId === userId);
    if (already) {
      return NextResponse.json({ 
        ok: true, 
        participantId: already.$id, 
        slot: already.slot 
      });
    }

    // Find an open human slot
    const open = parts.documents.find(p => p.userType === 'human' && !p.userId);
    if (!open) {
      return NextResponse.json(
        { ok: false, error: 'No open human slots' }, 
        { status: 409 }
      );
    }

    // Claim the slot
    const upd = await serverDatabases.updateDocument(
      DATABASE_ID, 
      'mock_draft_participants', 
      open.$id, 
      {
        userId, 
        displayName: displayName || open.displayName
      }
    );
    
    return NextResponse.json({ 
      ok: true, 
      participantId: upd.$id, 
      slot: upd.slot 
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message }, 
      { status: e.status || 500 }
    );
  }
}
