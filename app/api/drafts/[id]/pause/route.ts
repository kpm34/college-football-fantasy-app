import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/core/config/environment';
import { ID, Client, Databases } from 'node-appwrite';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: draftId } = await params;
  const { by, teamId } = await request.json().catch(() => ({}));

  // TODO: verify commissioner auth if needed

  // Append event
  const client = new Client()
    .setEndpoint(env.server.appwrite.endpoint)
    .setProject(env.server.appwrite.projectId)
    .setKey(env.server.appwrite.apiKey);
  const databases = new Databases(client);

  await databases.createDocument(
    env.server.appwrite.databaseId,
    env.client.collections.draftEvents,
    ID.unique(),
    { draftId, ts: new Date().toISOString(), type: 'pause', teamId: teamId || 'system', round: 0, overall: 0, by: by || undefined }
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
    env.server.appwrite.databaseId,
    env.client.collections.draftStates,
    ID.unique(),
    { draftId, onClockTeamId: state?.onClockTeamId || '', deadlineAt: state?.deadlineAt || new Date().toISOString(), round: state?.round || 1, pickIndex: state?.pickIndex || 1, status: 'paused' }
  );

  return NextResponse.json({ success: true, state });
}

export const runtime = 'nodejs';

