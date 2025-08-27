import { NextRequest, NextResponse } from 'next/server';
import { ID, Query } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: draftId } = params;

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
    const { playerId, fantasyTeamId, by } = await request.json();
    if (!playerId || !fantasyTeamId) {
      return NextResponse.json({ error: 'Missing playerId or fantasyTeamId' }, { status: 400 });
    }

    // Load ephemeral state from KV; fallback to latest draft_states when KV missing
    let state: any = null;
    try {
      const { kv } = await import('@vercel/kv');
      const raw = await kv.get(`draft:${draftId}:state`);
      state = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
    } catch {}

    if (!state) {
      try {
        const latest = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DRAFT_STATES,
          [Query.equal('draftId', draftId), Query.orderDesc('$createdAt'), Query.limit(1)]
        );
        const st = latest.documents?.[0];
        if (st) {
          // Minimal state reconstruction
          const lg = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, draftId);
          const rounds = Number((lg as any)?.draftRounds || 15);
          const picksPerRound = Number((st as any)?.picksPerRound || ((lg as any)?.draftOrder?.length || (Array.isArray((lg as any)?.members) ? (lg as any).members.length : 12)));
          state = {
            round: (st as any).round,
            pickIndex: (st as any).pickIndex,
            picksPerRound,
            totalTeams: picksPerRound,
            draftOrder: Array.isArray((lg as any).draftOrder)
              ? (lg as any).draftOrder
              : (typeof (lg as any).draftOrder === 'string'
                ? (() => { try { return JSON.parse((lg as any).draftOrder); } catch { return []; } })()
                : (Array.isArray((lg as any).members) ? (lg as any).members : [])),
            onClockTeamId: (st as any).onClockTeamId,
            deadlineAt: (st as any).deadlineAt,
            pickTimeSeconds: Number((lg as any)?.pickTimeSeconds || 90),
            overall: ((st as any).round - 1) * picksPerRound + (st as any).pickIndex,
            rounds
          } as any;
        }
      } catch {}
    }

    // Validate on-clock team & deadline
    // Enforce draft start time from Appwrite league document
    try {
      const leagueDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, draftId);
      const draftStart = (leagueDoc as any)?.draftDate ? new Date((leagueDoc as any).draftDate).getTime() : 0;
      if (draftStart && Date.now() < draftStart) {
        return NextResponse.json({ error: 'Draft has not started yet' }, { status: 400 });
      }
    } catch {}

    if (!state || state.onClockTeamId !== fantasyTeamId) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
    }
    if (state.deadlineAt) {
      const deadlineMs = new Date(state.deadlineAt).getTime();
      const nowMs = Date.now();
      // Allow small tolerance to account for client-server drift and network delay
      const driftAllowanceMs = 3000;
      if (nowMs > deadlineMs + driftAllowanceMs) {
        return NextResponse.json({ error: 'Pick deadline passed' }, { status: 400 });
      }
    }

    // Persist event and update state in Appwrite
    const overall = state.overall ?? (state.round - 1) * state.totalTeams + state.pickIndex;

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.draftEvents,
      ID.unique(),
      {
        draftId,
        ts: new Date().toISOString(),
        type: 'pick',
        fantasyTeamId,
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
    
    // Track picked player
    if (!next.pickedPlayerIds) next.pickedPlayerIds = [];
    next.pickedPlayerIds.push(playerId);
    
    // Update available players lists if they exist
    if (next.availablePlayers) {
      next.availablePlayers = next.availablePlayers.filter((id: string) => id !== playerId);
    }
    if (next.availablePlayersWithADP) {
      next.availablePlayersWithADP = next.availablePlayersWithADP.filter((p: any) => 
        p.id !== playerId && p.$id !== playerId
      );
    }

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
        draftStatus: 'drafting',
      }
    );

    // Update KV snapshot
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(`draft:${draftId}:state`, JSON.stringify(next));
    } catch {}

    // When a human picks, persist into DRAFT_PICKS for realtime UI and downstream roster save
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.DRAFT_PICKS,
      ID.unique(),
      {
        leagueId: draftId,
        userId: fantasyTeamId,
        playerId,
        playerName: undefined,
        playerPosition: undefined,
        playerTeam: undefined,
        round: state.round,
        pick: overall,
        timestamp: new Date().toISOString(),
      } as any
    ).catch(() => {});

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

