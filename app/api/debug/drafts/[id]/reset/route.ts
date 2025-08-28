import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export const runtime = 'nodejs';

// DEV-ONLY: Reset a league draft to pre-draft (clears deadline and state)
// Guarded by Authorization: Bearer <CRON_SECRET>
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = request.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leagueId = params.id;
  try {
    // Clear KV mirror
    try {
      const { kv } = await import('@vercel/kv');
      await kv.del(`draft:${leagueId}:state`);
    } catch {}

    // Delete draft_state docs for this league
    try {
      const states = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFT_STATES,
        [Query.equal('draftId', leagueId), Query.limit(100)]
      );
      for (const s of states.documents) {
        try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, (s as any).$id); } catch {}
      }
    } catch {}

    // Set drafts.draftStatus back to pre-draft and clear currentRound/currentPick
    try {
      const drafts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        [Query.equal('leagueId', leagueId), Query.limit(1)]
      );
      if (drafts.documents.length > 0) {
        const doc = drafts.documents[0] as any;
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          doc.$id,
          { draftStatus: 'pre-draft', currentRound: 0, currentPick: 0 } as any
        );
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to reset draft' }, { status: 500 });
  }
}


