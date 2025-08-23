import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: draftId } = params;
  const { by, fantasy_team_id } = await request.json().catch(() => ({}));

  // TODO: verify commissioner auth if needed

  // Append event
  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.draftEvents,
    ID.unique(),
    { draftId, ts: new Date().toISOString(), type: 'pause', teamId: fantasy_team_id || 'system', round: 0, overall: 0, by: by || undefined }
  );

  // Update state
  let state: any = null;
  try {
    const { kv } = await import('@vercel/kv');
    const raw = await kv.get(`draft:${draftId}:state`);
    state = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    if (state) {
      state.status = 'paused';
      await kv.set(`draft:${draftId}:state`, JSON.stringify(state));
    }
  } catch {}

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.DRAFT_STATES,
    ID.unique(),
    { draftId, onClockTeamId: state?.onClockTeamId || '', deadlineAt: state?.deadlineAt || new Date().toISOString(), round: state?.round || 1, pickIndex: state?.pickIndex || 1, status: 'paused' }
  );

  return NextResponse.json({ success: true, state });
}

export const runtime = 'nodejs';

