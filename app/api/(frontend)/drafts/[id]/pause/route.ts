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

import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: draftId } = params;
  const { by, fantasyTeamId } = await request.json().catch(() => ({}));

  // TODO: verify commissioner auth if needed

  // Append event
  await databases.createDocument(
    DATABASE_ID,
    (COLLECTIONS as any).DRAFT_EVENTS || 'draft_events',
    ID.unique(),
    { draftId, ts: new Date().toISOString(), type: 'pause', teamId: fantasyTeamId || 'system', round: 0, overall: 0, by: by || undefined }
  );

  // Update state
  let state: any = null;
  try {
    const { kv } = await import('@vercel/kv');
    const raw = await kv.get(`draft:${draftId}:state`);
    state = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    if (state) {
      state.draftStatus = 'paused';
      // Preserve remaining time by clearing deadlineAt (clients will treat as paused)
      // Optionally store remaining seconds for resume, if needed in future
      if (state.deadlineAt) {
        const remaining = Math.max(0, Math.floor((new Date(state.deadlineAt).getTime() - Date.now()) / 1000));
        state.remainingSeconds = remaining;
      }
      state.deadlineAt = undefined;
      await kv.set(`draft:${draftId}:state`, JSON.stringify(state));
    }
  } catch {}

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.DRAFT_STATES,
    ID.unique(),
    { draftId, onClockTeamId: state?.onClockTeamId || '', deadlineAt: state?.deadlineAt || null, round: state?.round || 1, pickIndex: state?.pickIndex || 1, draftStatus: 'paused' }
  );

  return NextResponse.json({ success: true, state });
}

export const runtime = 'nodejs';

