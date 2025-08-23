// app/api/mock-draft/join/route.ts
import { NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';
import { COLLECTIONS } from '@schema/zod-schema';

export async function POST(req: Request) {
  try {
    const { draftId, client_id, displayName } = await req.json();
    
    if (!draftId || !client_id) {
      return NextResponse.json(
        { ok: false, error: 'draftId and client_id required' }, 
        { status: 400 }
      );
    }

    // Get all participants for this draft
    const parts = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, [
      Query.equal('draftId', draftId),
      Query.orderAsc('slot'),
      Query.limit(100)
    ]);

    // Check if user is already in the draft (using displayName)
    const already = parts.documents.find(p => p.displayName === displayName);
    if (already) {
      return NextResponse.json({ 
        ok: true, 
        participantId: already.$id, 
        slot: already.slot 
      });
    }

    // Find an open bot slot to claim
    const open = parts.documents.find(p => p.userType === 'bot');
    if (!open) {
      return NextResponse.json(
        { ok: false, error: 'No open slots available' }, 
        { status: 409 }
      );
    }

    // Claim the slot by converting bot to human
    const upd = await serverDatabases.updateDocument(
      DATABASE_ID, 
      COLLECTIONS.DRAFT_EVENTS, 
      open.$id, 
      {
        userType: 'human',
        displayName: displayName || `User ${client_id.slice(0, 8)}`
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
