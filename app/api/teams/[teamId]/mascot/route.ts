import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases } from '@/lib/appwrite-server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MascotPayload {
  mascotPreset?: unknown;
  helmetPreset?: unknown;
  footballPreset?: unknown;
  thumbnailUrl?: string;
  splineUrl?: string;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = params.teamId;
    const roster = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      teamId
    );

    return NextResponse.json({
      mascotPreset: (roster as any).mascotPreset ?? null,
      helmetPreset: (roster as any).helmetPreset ?? null,
      footballPreset: (roster as any).footballPreset ?? null,
      thumbnailUrl: (roster as any).thumbnailUrl ?? null,
      splineUrl: (roster as any).splineUrl ?? null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to load mascot data' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = params.teamId;
    const body = (await request.json()) as MascotPayload;

    // Determine which attributes exist to avoid unknown attribute errors
    let updatePayload: Record<string, unknown> = {};
    try {
      const rostersCollection = await databases.getCollection(DATABASE_ID, COLLECTIONS.ROSTERS);
      const attributes: string[] = Array.isArray((rostersCollection as any).attributes)
        ? (rostersCollection as any).attributes.map((a: any) => a.key)
        : [];

      const candidate: Record<string, unknown> = {
        mascotPreset: body.mascotPreset,
        helmetPreset: body.helmetPreset,
        footballPreset: body.footballPreset,
        thumbnailUrl: body.thumbnailUrl,
        splineUrl: body.splineUrl
      };

      for (const key of Object.keys(candidate)) {
        if (candidate[key] !== undefined && attributes.includes(key)) {
          updatePayload[key] = candidate[key];
        }
      }
    } catch {
      // If schema lookup fails, store nothing to avoid breaking
      updatePayload = {};
    }

    if (Object.keys(updatePayload).length > 0) {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ROSTERS,
        teamId,
        updatePayload
      );
    }

    return NextResponse.json({ success: true, updated: Object.keys(updatePayload) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save mascot data' }, { status: 500 });
  }
}


