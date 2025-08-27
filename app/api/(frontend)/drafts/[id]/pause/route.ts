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
    COLLECTIONS.draftEvents,
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

