import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  const { id: draftId } = params;

  // Load state
  let state: any = null;
  try {
    const { kv } = await import('@vercel/kv');
    const raw = await kv.get(`draft:${draftId}:state`);
    state = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
  } catch {}

  if (!state || !state.deadlineAt || Date.now() <= new Date(state.deadlineAt).getTime()) {
    return NextResponse.json({ skipped: true });
  }

  // Get available players and select highest ADP (or projection)
  let playerId: string | null = null;
  
  try {
    // First try to get from pre-loaded available players with ADP
    if (state.availablePlayersWithADP && Array.isArray(state.availablePlayersWithADP)) {
      // Sort by ADP (lower is better) or projection (higher is better)
      const sorted = [...state.availablePlayersWithADP].sort((a, b) => {
        // If both have ADP, use that (lower is better)
        if (a.adp && b.adp) return a.adp - b.adp;
        // Otherwise use projection (higher is better)
        return (b.projection || 0) - (a.projection || 0);
      });
      playerId = sorted[0]?.id || sorted[0]?.$id;
    }
    
    // Fallback to simple available list
    if (!playerId) {
      const available: string[] = Array.isArray(state.availablePlayers) ? state.availablePlayers : [];
      playerId = available[0];
    }
    
    // If still no player, try to fetch best available from database
    if (!playerId && state.pickedPlayerIds) {
      const { Query } = await import('node-appwrite');
      const players = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS,
        [
          Query.equal('draftable', true),
          Query.orderAsc('adp_rank'),
          Query.limit(200)
        ]
      );
      
      const pickedSet = new Set(state.pickedPlayerIds);
      const bestAvailable = players.documents.find(p => !pickedSet.has(p.$id));
      if (bestAvailable) {
        playerId = bestAvailable.$id;
      }
    }
  } catch (e) {
    console.error('Error finding best player:', e);
    // Use simple fallback
    const available: string[] = Array.isArray(state.availablePlayers) ? state.availablePlayers : [];
    playerId = available[0];
  }
  
  if (!playerId) return NextResponse.json({ error: 'No players available' }, { status: 400 });

  const fantasyTeamId = state.onClockTeamId;

  const overall = state.overall ?? (state.round - 1) * state.totalTeams + state.pickIndex;

  await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.draftEvents,
    ID.unique(),
    {
      draftId,
      ts: new Date().toISOString(),
      type: 'autopick',
      fantasyTeamId,
      playerId,
      round: state.round,
      overall,
    }
  );

  // Advance minimal state
  const next = { ...state };
  next.pickIndex += 1;
  if (next.pickIndex > next.picksPerRound) {
    next.round += 1;
    next.pickIndex = 1;
  }
  const idx = (next.round % 2 === 1) ? next.pickIndex - 1 : next.picksPerRound - next.pickIndex;
  next.onClockTeamId = next.draftOrder[idx];
  next.deadlineAt = new Date(Date.now() + (next.pickTimeSeconds || 90) * 1000).toISOString();

  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(`draft:${draftId}:state`, JSON.stringify(next));
  } catch {}

  // Mirror persisted state
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

  return NextResponse.json({ success: true, state: next });
}

export const runtime = 'nodejs';

