import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: draftId } = params;
  const { by, fantasyTeamId } = await request.json().catch(() => ({}));

  // TODO: verify commissioner auth if needed

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.draftEvents,
    ID.unique(),
    { draftId, ts: new Date().toISOString(), type: 'resume', teamId: fantasyTeamId || 'system', round: 0, overall: 0, by: by || undefined }
  );

  // Update state
  let state: any = null;
  try {
    const { kv } = await import('@vercel/kv');
    const raw = await kv.get(`draft:${draftId}:state`);
    state = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    if (state) {
      state.draftStatus = 'drafting';
      const baseSeconds = typeof state.remainingSeconds === 'number' ? state.remainingSeconds : (state.pickTimeSeconds || 90);
      state.deadlineAt = new Date(Date.now() + baseSeconds * 1000).toISOString();
      delete state.remainingSeconds;
      await kv.set(`draft:${draftId}:state`, JSON.stringify(state));
    }
  } catch {}

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.DRAFT_STATES,
    ID.unique(),
    { draftId, onClockTeamId: state?.onClockTeamId || '', deadlineAt: state?.deadlineAt || new Date().toISOString(), round: state?.round || 1, pickIndex: state?.pickIndex || 1, draftStatus: 'drafting' }
  );

  return NextResponse.json({ success: true, state });
}

export const runtime = 'nodejs';

