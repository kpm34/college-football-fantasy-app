import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalize(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    // Require admin session
    const sessionCookie = request.cookies.get('appwrite-session')?.value;
    if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    if (!userRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const currentUser = await userRes.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
    if ((currentUser.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { dryRun = true, limit = 1000, offset = 0 } = await request.json().catch(() => ({ dryRun: true }));

    // Fetch batch of players
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYERS || 'college_players',
      [Query.limit(limit), Query.offset(offset)]
    );

    const seen = new Map<string, any>();
    const duplicates: any[] = [];

    for (const doc of res.documents || []) {
      const key = `${normalize(doc.name || `${doc.firstName ?? ''} ${doc.lastName ?? ''}`)}|${normalize(doc.team || doc.school)}|${normalize(doc.position || doc.pos)}`;
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, doc);
      } else {
        // prefer higher rating; otherwise keep first
        const existingRating = existing.rating ?? existing.ea_rating ?? 0;
        const currentRating = doc.rating ?? doc.ea_rating ?? 0;
        if (currentRating > existingRating) {
          // new becomes keeper; old becomes duplicate
          duplicates.push(existing);
          seen.set(key, doc);
        } else {
          duplicates.push(doc);
        }
      }
    }

    let deleted = 0;
    if (!dryRun) {
      for (const d of duplicates) {
        try {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PLAYERS || 'college_players', d.$id);
          deleted += 1;
        } catch (e) {
          // continue
        }
      }
    }

    return NextResponse.json({
      success: true,
      scanned: res.documents?.length || 0,
      duplicates: duplicates.map((d) => d.$id),
      deleted,
      dryRun: Boolean(dryRun),
      total: res.total,
      nextOffset: offset + limit < res.total ? offset + limit : null,
    });
  } catch (error: any) {
    console.error('Admin dedupe players error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


