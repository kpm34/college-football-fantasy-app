import { NextRequest, NextResponse } from 'next/server';
import { createRunwayJob } from '@/lib/runway';
import { serverDatabases as databases } from '@/lib/appwrite-server';
import { DATABASE_ID } from '@/lib/appwrite';
import { ID } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COLLECTION_ID = 'runway_jobs';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, duration, aspectRatio, userId, metadata, webhookSecret } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Create Runway job
    const { jobId } = await createRunwayJob({
      prompt,
      model: model || 'gen3',
      duration: duration || 5,
      aspectRatio: aspectRatio || '16:9',
    });

    // Build payload only with attributes that exist in the collection
    let allowedKeys = new Set<string>();
    try {
      const col: any = await databases.getCollection(DATABASE_ID, COLLECTION_ID);
      for (const attr of col?.attributes || []) {
        if (attr?.key) allowedKeys.add(attr.key as string);
      }
    } catch {
      // Collection might not exist yet, use basic payload
    }

    const candidate: Record<string, unknown> = {
      status: 'QUEUED',
      provider: 'runway',
      providerId: jobId,
      prompt,
      model: model || 'gen3',
      duration: duration || 5,
      aspectRatio: aspectRatio || '16:9',
      resultUrl: '',
      userId: userId || null,
      webhookSecret: webhookSecret || null,
      createdAt: new Date().toISOString(),
      metadata,
    };

    const payload: Record<string, unknown> = {};
    if (allowedKeys.size > 0) {
      for (const [k, v] of Object.entries(candidate)) {
        if (allowedKeys.has(k)) payload[k] = v;
      }
    }

    // Store job in database
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      allowedKeys.size > 0 ? payload : { status: 'QUEUED', providerId: jobId }
    );

    return NextResponse.json({ 
      ok: true, 
      id: doc.$id,
      runwayJobId: jobId,
      status: 'QUEUED'
    });
  } catch (error: any) {
    console.error('Runway job creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create runway job' },
      { status: 500 }
    );
  }
}