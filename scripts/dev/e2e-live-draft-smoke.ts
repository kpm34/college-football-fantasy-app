/*
  Live Draft E2E Smoke Test
  - Creates a temporary 2-team league and draft
  - Forces start via cron endpoint
  - Makes two picks via live API routes
  - Verifies draft_picks and roster_slots were written
*/

import { ID, Query } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const baseUrl = process.env.BASE_URL || 'https://cfbfantasy.app';
  const cronSecret = process.env.CRON_SECRET || '';
  if (!cronSecret) throw new Error('CRON_SECRET is required');

  // 1) Create league
  const leagueName = `E2E Smoke ${new Date().toISOString().slice(11,19)}`;
  const league = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.LEAGUES,
    ID.unique(),
    {
      leagueName,
      season: Number(process.env.SEASON_YEAR || new Date().getFullYear()),
      maxTeams: 4,
      currentTeams: 2,
      leagueStatus: 'open',
      isPublic: true,
      gameMode: 'power4',
      draftType: 'snake',
      pickTimeSeconds: 30,
      draftDate: new Date(Date.now() + 10_000).toISOString(),
      selectedConference: 'ALL',
      commissionerAuthUserId: 'BOT-COMM',
      scoringRules: '{}',
    } as any
  );

  // 2) Create two fantasy teams
  const t1 = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.FANTASY_TEAMS,
    ID.unique(),
    { leagueId: league.$id, teamName: 'BOT-A', ownerAuthUserId: 'BOT-A' } as any
  );
  const t2 = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.FANTASY_TEAMS,
    ID.unique(),
    { leagueId: league.$id, teamName: 'BOT-B', ownerAuthUserId: 'BOT-B' } as any
  );

  // 3) Create drafts doc
  const draft = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.DRAFTS,
    ID.unique(),
    {
      leagueId: league.$id,
      draftStatus: 'pre-draft',
      startTime: new Date(Date.now() + 12_000).toISOString(),
      type: 'snake',
      clockSeconds: 30,
      orderJson: JSON.stringify({ draftOrder: [t1.$id, t2.$id] }),
      leagueName: leagueName,
      maxTeams: 4,
    } as any
  );

  console.log('Seeded league:', league.$id, 'draft:', draft.$id);

  // 4) Start draft directly (force)
  const startRes = await fetch(`${baseUrl}/api/drafts/${league.$id}/start?force=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cronSecret}` }
  });
  console.log('Start response:', startRes.status);

  // Wait for draft_states snapshot
  for (let i = 0; i < 10; i++) {
    const states = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_STATES,
      [Query.equal('draftId', league.$id), Query.orderDesc('$createdAt'), Query.limit(1)]
    );
    if (states.documents.length > 0 && (states.documents[0] as any).draftStatus === 'drafting') {
      console.log('Draft started with state:', states.documents[0].$id);
      break;
    }
    await sleep(1000);
  }

  // 5) Pick two players via live API
  const players = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.COLLEGE_PLAYERS,
    [Query.equal('eligible', true), Query.limit(2)]
  );
  const p1 = players.documents[0]?.$id; const p2 = players.documents[1]?.$id;
  if (!p1 || !p2) throw new Error('Not enough eligible players to test');

  const pick1 = await fetch(`${baseUrl}/api/drafts/${league.$id}/pick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: p1, fantasyTeamId: t1.$id, by: 'BOT-A' })
  });
  console.log('Pick1 status:', pick1.status);
  await sleep(1500);

  const pick2 = await fetch(`${baseUrl}/api/drafts/${league.$id}/pick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId: p2, fantasyTeamId: t2.$id, by: 'BOT-B' })
  });
  console.log('Pick2 status:', pick2.status);

  // 6) Verify
  const picks = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.DRAFT_PICKS,
    [Query.equal('leagueId', league.$id), Query.limit(10)]
  );
  const slots1 = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.ROSTER_SLOTS,
    [Query.equal('fantasyTeamId', t1.$id), Query.limit(10)]
  );
  console.log('Picks:', picks.total || picks.documents.length, 'RosterSlots team1:', slots1.total || slots1.documents.length);

  if ((picks.total || picks.documents.length) < 2) throw new Error('Draft picks not persisted');
  if ((slots1.total || slots1.documents.length) < 1) throw new Error('Roster slot not created for team1');

  console.log('✅ E2E live draft smoke passed for league', league.$id);
}

main().catch((e) => { console.error(e); process.exit(1); });


