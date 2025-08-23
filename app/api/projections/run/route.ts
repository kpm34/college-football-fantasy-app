import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ID } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';

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

    const runId = ID.unique();
    const startedAt = new Date().toISOString();

    // Create projection_runs record (running)
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.projection_runs,
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
        DATABASE_ID,
        COLLECTIONS.PROJECTIONS,
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

    // Finish run and write metrics to separate collection
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.projection_runs,
      runId,
      {
        status: 'success',
        finishedAt: new Date().toISOString(),
      }
    );

    // Minimal example metrics (could be computed MAE/MAPE, etc.)
    const metrics = {
      sampleSize: demoPlayers.length,
      meanPoints: demoPlayers.reduce((s, p) => s + p.points, 0) / demoPlayers.length,
    };

    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.projection_run_metrics,
        runId,
        {
          runId,
          metrics: JSON.stringify(metrics),
        }
      );
    } catch (e) {
      // Non-fatal: metrics are auxiliary
    }

    return NextResponse.json({ success: true, runId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Invalid request' }, { status: 400 });
  }
}

export const runtime = 'nodejs';

