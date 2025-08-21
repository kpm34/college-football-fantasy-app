import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const now = Date.now();

    // Find leagues ready to start: status 'full' and draftDate <= now
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [
        Query.equal('status', 'full'),
        Query.lessThanEqual('draftDate', new Date(now).toISOString()),
        Query.limit(100),
      ]
    );

    const toStart = res.documents || [];
    const results: any[] = [];

    for (const lg of toStart) {
      try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/drafts/${lg.$id}/start?force=true`, {
          method: 'POST',
          headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
        });
        results.push({ id: lg.$id, ok: resp.ok });
      } catch (e: any) {
        results.push({ id: lg.$id, ok: false, error: e?.message });
      }
    }

    return NextResponse.json({ started: results.filter(r => r.ok).length, attempted: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}


