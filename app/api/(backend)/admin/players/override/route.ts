import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Allows correcting a player's team/school and draftable flag by persisting into model_inputs.manual_overrides_json
// Auth: requires the current session email to match ADMIN_EMAIL
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });
    if (!meRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const me = await meRes.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((me.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { playerId, season, team, draftable } = await request.json();
    if (!playerId || !season) {
      return NextResponse.json({ error: 'playerId and season are required' }, { status: 400 });
    }

    // Get or create the model_inputs doc for this season
    const miList = await databases.listDocuments(
      DATABASE_ID,
      (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs',
      [Query.equal('season', Number(season)), Query.limit(1)]
    );
    let doc = miList.documents?.[0];
    if (!doc) {
      // Create a minimal doc if missing
      doc = await databases.createDocument(
        DATABASE_ID,
        (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs',
        ID.unique(),
        { season: Number(season), manual_overrides_json: {} }
      );
    }

    const overrides = (doc.manual_overrides_json as any) || {};
    overrides[playerId] = {
      ...(overrides[playerId] || {}),
      ...(team ? { team } : {}),
      ...(typeof draftable === 'boolean' ? { draftable } : {}),
      updatedAt: new Date().toISOString(),
    };

    await databases.updateDocument(
      DATABASE_ID,
      (COLLECTIONS as any).MODEL_INPUTS || 'model_inputs',
      doc.$id,
      { manual_overrides_json: overrides }
    );

    return NextResponse.json({ success: true, season: Number(season), playerId, override: overrides[playerId] });
  } catch (error: any) {
    console.error('Admin override error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


