import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: draftId } = await params;

  // SETNX lock guard (3s TTL)
  try {
    const { kv } = await import('@vercel/kv');
    const lockKey = `draft:${draftId}:lock`;
    const now = Date.now();
    const set = await kv.setnx(lockKey, String(now));
    if (!set) {
      const existing = Number(await kv.get(lockKey)) || 0;
      if (now - existing < 3000) {
        return NextResponse.json({ error: 'Another pick in progress' }, { status: 409 });
      }
    }
    await kv.expire(lockKey, 3);
  } catch {}

  try {
    const { playerId, teamId, by } = await request.json();
    if (!playerId || !teamId) {
      return NextResponse.json({ error: 'Missing playerId or teamId' }, { status: 400 });
    }

    // Load ephemeral state from KV
    let state: any = null;
    try {
      const { kv } = await import('@vercel/kv');
      const raw = await kv.get(`draft:${draftId}:state`);
      state = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    } catch {}

    // Validate on-clock team & deadline
    if (!state || state.onClockTeamId !== teamId) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }
    if (state.deadlineAt && Date.now() > new Date(state.deadlineAt).getTime()) {
      return NextResponse.json({ error: 'Pick deadline passed' }, { status: 400 });
    }

    // Persist event and update state in Appwrite
    const overall = state.overall ?? (state.round - 1) * state.totalTeams + state.pickIndex;

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DRAFT_EVENTS,
      ID.unique(),
      {
        draftId,
        ts: new Date().toISOString(),
        type: 'pick',
        teamId,
        playerId,
        round: state.round,
        overall,
        by: by || undefined,
      }
    );

    // Advance state
    const next = { ...state };
    next.pickIndex += 1;
    if (next.pickIndex > next.picksPerRound) {
      next.round += 1;
      next.pickIndex = 1;
    }
    // Compute next onClockTeamId (snake or straight controlled by state)
    const idx = (next.round % 2 === 1) ? next.pickIndex - 1 : next.picksPerRound - next.pickIndex;
    next.onClockTeamId = next.draftOrder[idx];
    next.deadlineAt = new Date(Date.now() + (next.pickTimeSeconds || 90) * 1000).toISOString();

    // Persist state mirror
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DRAFT_STATES,
      ID.unique(),
      {
        draftId,
        onClockTeamId: next.onClockTeamId,
        deadlineAt: next.deadlineAt,
        round: next.round,
        pickIndex: next.pickIndex,
        status: 'active',
      }
    );

    // Update KV snapshot
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(`draft:${draftId}:state`, JSON.stringify(next));
    } catch {}

    // Publish realtime (Appwrite functions/channels can observe draft_events)
    return NextResponse.json({ success: true, state: next });
  } finally {
    try {
      const { kv } = await import('@vercel/kv');
      await kv.del(`draft:${draftId}:lock`);
    } catch {}
  }
}

export const runtime = 'nodejs';

