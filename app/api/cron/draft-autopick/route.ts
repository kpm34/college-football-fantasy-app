import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const fromVercelCron = Boolean(request.headers.get('x-vercel-cron'));
    if (!fromVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const nowIso = new Date().toISOString();

    // Find active drafts with expired deadlines
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_STATES,
      [
        Query.equal('status', 'active'),
        Query.lessThanEqual('deadlineAt', nowIso),
        Query.limit(100),
      ]
    );

    const due = res.documents || [];
    let successes = 0;
    const results: any[] = [];

    for (const st of due) {
      try {
        const base = (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL.trim()) || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
        const resp = await fetch(`${base}/api/drafts/${st.draftId}/autopick`, {
          method: 'POST',
          headers: fromVercelCron ? {} : { authorization: `Bearer ${process.env.CRON_SECRET}` },
        });
        if (resp.ok) successes += 1;
        results.push({ id: st.draftId, ok: resp.ok });
      } catch (e: any) {
        results.push({ id: st.draftId, ok: false, error: e?.message });
      }
    }

    return NextResponse.json({ autopicked: successes, attempted: due.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}


