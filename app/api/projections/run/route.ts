import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Client, Databases, ID } from 'node-appwrite';
import { env } from '@/core/config/environment';

const BodySchema = z.object({
  version: z.number().int().min(1),
  scope: z.enum(['season', 'week']),
  season: z.number().int(),
  week: z.number().int().optional(),
  weights: z.record(z.string(), z.number()).optional(),
  sources: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = BodySchema.parse(body);

    const client = new Client()
      .setEndpoint(env.server.appwrite.endpoint)
      .setProject(env.server.appwrite.projectId)
      .setKey(env.server.appwrite.apiKey);
    const databases = new Databases(client);

    const runId = ID.unique();
    const startedAt = new Date().toISOString();

    // Create projection_runs record (running)
    await databases.createDocument(
      env.server.appwrite.databaseId,
      env.client.collections.projectionRuns || 'projection_runs',
      runId,
      {
        runId,
        version: input.version,
        scope: input.scope,
        season: input.season,
        week: input.week,
        weights: JSON.stringify(input.weights || {}),
        sources: JSON.stringify(input.sources || {}),
        status: 'running',
        startedAt,
      }
    );

    // Compute minimal demo projections (replace with real engine)
    const demoPlayers = Array.from({ length: 10 }).map((_, i) => ({
      playerId: `demo-${i + 1}`,
      points: 100 - i,
      components: { base: 80 - i, talentMultiplier: 1 + (i * 0.01) },
    }));

    for (const p of demoPlayers) {
      await databases.createDocument(
        env.server.appwrite.databaseId,
        env.client.collections.playerProjections || 'player_projections',
        ID.unique(),
        {
          playerId: p.playerId,
          season: input.season,
          week: input.week,
          version: input.version,
          points: p.points,
          components: JSON.stringify(p.components),
        }
      );
    }

    // Finish run with metrics
    await databases.updateDocument(
      env.server.appwrite.databaseId,
      env.client.collections.projectionRuns || 'projection_runs',
      runId,
      {
        status: 'success',
        metrics: JSON.stringify({ mae: 0, mape: 0 }),
        finishedAt: new Date().toISOString(),
      }
    );

    return NextResponse.json({ success: true, runId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid request' }, { status: 400 });
  }
}

export const runtime = 'nodejs';

