import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export const runtime = 'nodejs';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const leagueId = params.id;
  try {
    // Load latest state
    const st = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_STATES,
      [Query.equal('draftId', leagueId), Query.orderDesc('$createdAt'), Query.limit(1)]
    );
    const current = st.documents?.[0] || null;

    const payload = {
      draftId: leagueId,
      onClockTeamId: current?.onClockTeamId || null,
      deadlineAt: current?.deadlineAt || null,
      round: current?.round || 1,
      pickIndex: current?.pickIndex || 1,
      draftStatus: 'paused',
    } as any;

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DRAFT_STATES,
      ID.unique(),
      payload
    );

    // Also update KV snapshot if present
    try {
      const { kv } = await import('@vercel/kv');
      const raw = await kv.get(`draft:${leagueId}:state`);
      const state = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      if (state) {
        state.draftStatus = 'paused';
        await kv.set(`draft:${leagueId}:state`, JSON.stringify(state));
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to pause draft' }, { status: 500 });
  }
}

// End of file
