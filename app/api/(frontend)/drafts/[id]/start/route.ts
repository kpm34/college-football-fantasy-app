import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { id: leagueId } = params;

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
          // Use commissionerAuthUserId as canonical field
          const comm = (league as any)?.commissionerAuthUserId || (league as any)?.commissioner;
          isCommissioner = String(comm || '') === String(user.$id);
        }
      }
    } catch {}

    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    // Determine canonical start time: prefer drafts.startTime, fallback to league.draftDate
    let startMs = 0;
    try {
      const drafts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        [Query.equal('leagueId', leagueId), Query.limit(1)]
      );
      const draftDoc = drafts.documents?.[0] as any;
      if (draftDoc?.startTime) startMs = new Date(draftDoc.startTime).getTime();
    } catch {}
    if (!startMs && (league as any)?.draftDate) {
      startMs = new Date((league as any).draftDate).getTime();
    }
    // Enforce start time unless overridden
    if (startMs && Date.now() < startMs && !(force && (isCron || isCommissioner))) {
      return NextResponse.json({ error: 'Draft has not started yet' }, { status: 400 });
    }

    // If state already exists in KV, optionally refresh the deadline if requested/needed
    let existing: any = null;
    try {
      const { kv } = await import('@vercel/kv');
      const raw = await kv.get(`draft:${leagueId}:state`);
      existing = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null;
      if (existing) {
        const nowMs = Date.now();
        const url = new URL(request.url);
        const reset = url.searchParams.get('reset') === 'true' || url.searchParams.get('force') === 'true';
        const deadlineMs = existing.deadlineAt ? new Date(existing.deadlineAt).getTime() : 0;
        // If reset requested or deadline has passed and no picks exist yet, reseed deadline and return
        if (reset || (deadlineMs && nowMs > deadlineMs)) {
          // Check there are no picks yet
          try {
            const picks = await databases.listDocuments(
              DATABASE_ID,
              COLLECTIONS.DRAFT_PICKS,
              [Query.equal('leagueId', leagueId), Query.limit(1)]
            );
            const nonePicked = (picks.total || picks.documents.length) === 0;
            if (nonePicked) {
              const pickTimeSeconds = Number((league as any)?.pickTimeSeconds || 90);
              existing.deadlineAt = new Date(nowMs + pickTimeSeconds * 1000).toISOString();
              existing.onClockTeamId = existing.draftOrder?.[0] || existing.onClockTeamId;
              try {
                await kv.set(`draft:${leagueId}:state`, JSON.stringify(existing));
              } catch {}
              try {
                await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, ID.unique(), {
                  draftId: leagueId,
                  onClockTeamId: existing.onClockTeamId,
                  deadlineAt: existing.deadlineAt,
                  round: existing.round || 1,
                  pickIndex: existing.pickIndex || 1,
                  draftStatus: 'drafting',
                  picksPerRound: existing.picksPerRound || existing.totalTeams || 12,
                } as any);
              } catch {}
            }
          } catch {}
        }
        return NextResponse.json({ success: true, state: existing, alreadyStarted: true });
      }
    } catch {}

    // Build draft order (prefer drafts.orderJson; fallback to league/scoringRules/members)
    let order: string[] = [];
    try {
      // Find the draft record for this league
      let draftDoc: any = null;
      try {
        const drafts = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          [Query.equal('leagueId', leagueId), Query.limit(1)]
        );
        draftDoc = drafts.documents?.[0] || null;
      } catch {}

      if (draftDoc?.orderJson) {
        try {
          const parsed = JSON.parse(draftDoc.orderJson);
          if (Array.isArray(parsed?.draftOrder)) {
            order = parsed.draftOrder;
          }
        } catch {}
      }
    } catch {}
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
      // Do NOT auto-append bots here. Bots are only added when the commissioner clicks "Fill With Bots".
    } catch {}

    if (order.length === 0) {
      return NextResponse.json({ error: 'No draft order set' }, { status: 400 });
    }

    const rounds = Number((league as any)?.draftRounds || 15);
    const pickTimeSeconds = Number((league as any)?.pickTimeSeconds || 90);
    
    // Normalize order entries to fantasyTeam document IDs
    // Some older flows saved authUserIds in orderJson; we map them to team IDs here
    let teamIdOrder: string[] = [];
    try {
      const teamsRes = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FANTASY_TEAMS,
        [Query.equal('leagueId', leagueId), Query.limit(200)]
      );
      const ownerToTeam = new Map<string, string>();
      const teamIdSet = new Set<string>();
      for (const t of teamsRes.documents as any[]) {
        if (t?.ownerAuthUserId) ownerToTeam.set(String(t.ownerAuthUserId), String(t.$id));
        teamIdSet.add(String(t.$id));
      }
      teamIdOrder = order.map((id) => {
        const str = String(id);
        if (teamIdSet.has(str)) return str; // already a team ID
        const mapped = ownerToTeam.get(str);
        return mapped || str; // fallback to original to avoid empty slot
      }).filter(Boolean);
    } catch {
      teamIdOrder = [...order];
    }
    const now = Date.now();

    const state = {
      leagueId,
      draftStatus: 'drafting',
      round: 1,
      pickIndex: 1,
      picksPerRound: teamIdOrder.length,
      totalTeams: teamIdOrder.length,
      totalRounds: rounds,
      overall: 1,
      draftOrder: teamIdOrder,
      onClockTeamId: teamIdOrder[0],
      deadlineAt: new Date(now + pickTimeSeconds * 1000).toISOString(),
      pickTimeSeconds,
      pickedPlayerIds: [], // Track picked players
      availablePlayers: [], // Will be populated by draft UI
      availablePlayersWithADP: [], // Will be populated with ADP data
    } as any;

    // Persist KV snapshot
    try {
      const { kv } = await import('@vercel/kv');
      await kv.set(`draft:${leagueId}:state`, JSON.stringify(state));
    } catch {}

    // Mirror to DRAFT_STATES collection for observability (if it exists)
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, ID.unique(), {
        draftId: leagueId,
        onClockTeamId: state.onClockTeamId,
        deadlineAt: state.deadlineAt,
        round: state.round,
        pickIndex: state.pickIndex,
        draftStatus: 'drafting',
        // helpful for fallback reconstruction
        picksPerRound: state.picksPerRound,
      } as any);
    } catch (error: any) {
      console.log('[Draft Start] Could not create draft state document:', error.message);
    }

    // Also update the DRAFTS collection status for cron/consumers parity
    try {
      const drafts = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        [Query.equal('leagueId', leagueId), Query.limit(1)]
      );
      if (drafts.documents.length > 0) {
        const doc = drafts.documents[0];
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          doc.$id,
          { draftStatus: 'drafting', currentRound: 1, currentPick: 1, orderJson: JSON.stringify({ draftOrder: teamIdOrder }) } as any
        );
      }
    } catch {}

    return NextResponse.json({ success: true, state });
  } catch (error: any) {
    console.error('Start draft error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to start draft' }, { status: 500 });
  }
}

export const runtime = 'nodejs';


