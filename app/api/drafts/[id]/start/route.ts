import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: leagueId } = await params;

  try {
    // Load league
    const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId);

    // Authorization: allow either commissioner session or CRON secret
    const authHeader = request.headers.get('authorization') || '';
    const isCron = !!process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`;

    let isCommissioner = false;
    try {
      const sessionCookie = request.cookies.get('appwrite-session')?.value;
      if (sessionCookie) {
        const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
        const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
          headers: {
            'X-Appwrite-Project': 'college-football-fantasy-app',
            'X-Appwrite-Response-Format': '1.4.0',
            'Cookie': cookieHeader,
          },
        });
        if (userRes.ok) {
          const user = await userRes.json();
          isCommissioner = String((league as any)?.commissioner) === String(user.$id);
        }
      }
    } catch {}

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    // Enforce draft start time unless overridden by commissioner or cron with force=true
    const draftStartMs = (league as any)?.draftDate ? new Date((league as any).draftDate).getTime() : 0;
    if (draftStartMs && Date.now() < draftStartMs && !(force && (isCron || isCommissioner))) {
      return NextResponse.json({ error: 'Draft has not started yet' }, { status: 400 });
    }

    // If state already exists in KV, return it (idempotent)
    let existing: any = null;
    try {
      const { kv } = await import('@vercel/kv');
      const raw = await kv.get(`draft:${leagueId}:state`);
      existing = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      if (existing) {
        return NextResponse.json({ success: true, state: existing, alreadyStarted: true });
      }
    } catch {}

    // Build draft order
    let order: string[] = [];
    try {
      const rawOrder = (league as any).draftOrder;
      if (Array.isArray(rawOrder)) order = rawOrder as any;
      else if (typeof rawOrder === 'string') {
        try { order = JSON.parse(rawOrder); } catch {}
      }
      if (order.length === 0 && typeof (league as any).scoringRules === 'string') {
        try {
          const rules = JSON.parse((league as any).scoringRules);
          if (Array.isArray(rules?.draftOrderOverride)) order = rules.draftOrderOverride;
        } catch {}
      }
      if (order.length === 0 && Array.isArray((league as any).members)) {
        order = [...(league as any).members];
      }
    } catch {}

    if (order.length === 0) {
      return NextResponse.json({ error: 'No draft order set' }, { status: 400 });
    }

    const rounds = Number((league as any)?.draftRounds || 15);
    const pickTimeSeconds = Number((league as any)?.pickTimeSeconds || 90);
    const now = Date.now();

    const state = {
      leagueId,
      status: 'active',
      round: 1,
      pickIndex: 1,
      picksPerRound: order.length,
      totalTeams: order.length,
      totalRounds: rounds,
      overall: 1,
      draftOrder: order,
      onClockTeamId: order[0],
      deadlineAt: new Date(now + pickTimeSeconds * 1000).toISOString(),
      pickTimeSeconds,
    } as any;

    // Persist KV snapshot
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(`draft:${leagueId}:state`, JSON.stringify(state));
    } catch {}

    // Mirror to DRAFT_STATES collection for observability (if it exists)
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, 'unique()', {
        draftId: leagueId,
        onClockTeamId: state.onClockTeamId,
        deadlineAt: state.deadlineAt,
        round: state.round,
        pickIndex: state.pickIndex,
        status: 'active',
        // helpful for fallback reconstruction
        picksPerRound: state.picksPerRound,
      } as any);
    } catch (error: any) {
      // DRAFT_STATES collection might not exist, that's okay
      console.log('[Draft Start] Could not create draft state document:', error.message);
    }
    
    // Update the league status to indicate draft has started
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId, {
        status: 'drafting'
      });
    } catch (error: any) {
      console.log('[Draft Start] Could not update league status:', error.message);
    }

    return NextResponse.json({ success: true, state });
  } catch (error: any) {
    console.error('Start draft error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to start draft' }, { status: 500 });
  }
}

export const runtime = 'nodejs';


