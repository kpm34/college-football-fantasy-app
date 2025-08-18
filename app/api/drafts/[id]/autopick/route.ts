import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/core/config/environment';
import { ID, Client, Databases } from 'node-appwrite';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: draftId } = await params;

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

  // Select top available by projections/ADP (placeholder: first available)
  const available: string[] = Array.isArray(state.availablePlayers) ? state.availablePlayers : [];
  const playerId = available[0];
  if (!playerId) return NextResponse.json({ error: 'No players available' }, { status: 400 });

  const teamId = state.onClockTeamId;

  const client = new Client()
    .setEndpoint(env.server.appwrite.endpoint)
    .setProject(env.server.appwrite.projectId)
    .setKey(env.server.appwrite.apiKey);
  const databases = new Databases(client);

  const overall = state.overall ?? (state.round - 1) * state.totalTeams + state.pickIndex;

  await databases.createDocument(
    env.server.appwrite.databaseId,
    env.client.collections.draftEvents,
    ID.unique(),
    {
      draftId,
      ts: new Date().toISOString(),
      type: 'autopick',
      teamId,
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
    env.server.appwrite.databaseId,
    env.client.collections.draftStates,
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

