import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Admin auth via current session + allowlist email
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
    });
    if (!meRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const me = await meRes.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((me.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { players = [], reason = 'admin_retired' } = await request.json();
    if (!Array.isArray(players) || players.length === 0) {
      return NextResponse.json({ error: 'players array required' }, { status: 400 });
    }

    const updated: string[] = [];
    const notFound: string[] = [];
    for (const p of players) {
      const name: string = (p?.name || '').trim();
      const team: string | undefined = p?.team?.trim();
      const position: string | undefined = p?.position?.trim();
      if (!name) continue;
      // Try exact match first
      let docs = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        [Query.equal('name', name), ...(team ? [Query.equal('team', team)] : []), ...(position ? [Query.equal('position', position)] : []), Query.limit(10)]
      );
      // Fallback to relaxed search if needed
      if (!docs.documents || docs.documents.length === 0) {
        const batch = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PLAYERS || 'college_players',
          [Query.limit(200)]
        );
        const lower = name.toLowerCase();
        docs = { documents: (batch.documents || []).filter((d: any) =>
          (d.name || '').toLowerCase() === lower || (d.name || '').toLowerCase().includes(lower)
        ) } as any;
      }
      if (!docs.documents || docs.documents.length === 0) {
        notFound.push(name);
        continue;
      }
      for (const doc of docs.documents) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PLAYERS || 'college_players',
            doc.$id,
            { draftable: false, retired_reason: reason }
          );
          updated.push(doc.$id);
        } catch {}
      }
    }

    return NextResponse.json({ success: true, updatedCount: updated.length, updated, notFound });
  } catch (error: any) {
    console.error('Admin players retire error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


