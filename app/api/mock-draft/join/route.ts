// app/api/mock-draft/join/route.ts
import { NextResponse } from 'next/server';
import { serverDatabases, DATABASE_ID } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';
import { COLLECTIONS } from '@schema/zod-schema';

export async function POST(req: Request) {
  try {
    const { draftId, clientId, displayName } = await req.json();
    
    if (!draftId) {
      return NextResponse.json(
        { ok: false, error: 'draftId required' }, 
        { status: 400 }
      );
    }

    // Get all participants for this draft
    const parts = await serverDatabases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, [
      Query.equal('draftId', draftId),
      Query.equal('type', 'participant'),
      Query.orderAsc('overall'),
      Query.limit(100)
    ]);

    // Parse participant data from payload_json
    const participants = parts.documents.map((doc: any) => {
      if (doc.payloadJson) {
        const data = JSON.parse(doc.payloadJson);
        return { ...doc, ...data };
      }
      return doc;
    });

    // Check if user is already in the draft (using displayName)
    const already = participants.find(p => p.displayName === displayName);
    if (already) {
      return NextResponse.json({ 
        ok: true, 
        participantId: already.$id, 
        slot: already.slot 
      });
    }

    // Find an open bot slot to claim
    const open = participants.find(p => p.userType === 'bot');
    if (!open) {
      return NextResponse.json(
        { ok: false, error: 'No open slots available' }, 
        { status: 409 }
      );
    }

    // Claim the slot by converting bot to human
    const updatedData = {
      userType: 'human',
      displayName: displayName || 'Guest Player',
      slot: open.slot,
      clientId: client_id || null
    };
    
    const upd = await serverDatabases.updateDocument(
      DATABASE_ID, 
      COLLECTIONS.DRAFT_EVENTS, 
      open.$id, 
      {
        payloadJson: JSON.stringify(updatedData)
      }
    );
    
    return NextResponse.json({ 
      ok: true, 
      participantId: upd.$id, 
      slot: updatedData.slot // Use slot from updatedData since it's in payloadJson
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message }, 
      { status: e.status || 500 }
    );
  }
}
