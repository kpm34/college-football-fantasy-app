import { Client, Databases, ID } from 'node-appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-generated';

async function main() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
  const apiKey = (process.env.APPWRITE_API_KEY || '').replace(/^"|"$/g, '');
  if (!apiKey) throw new Error('APPWRITE_API_KEY not set');

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
  const databases = new Databases(client);
  const leagueId = ID.unique();
  const now = Date.now();
  // Start immediately to exercise start-drafts
  const startTime = new Date(now + 15_000).toISOString(); // 15s from now

  const users = [
    { authUserId: 'test-user-1', displayName: 'Alpha' },
    { authUserId: 'test-user-2', displayName: 'Bravo' },
    { authUserId: 'test-user-3', displayName: 'Charlie' },
  ];

  console.log('Seeding test league and draft...');

  // Create league
  const league = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.LEAGUES,
    leagueId,
    {
      leagueName: 'Test League ' + new Date().toISOString().slice(11,19),
      season: 2025,
      maxTeams: Math.max(4, users.length),
      currentTeams: users.length,
      leagueStatus: 'open',
      isPublic: true,
      draftType: 'snake',
      gameMode: 'sec',
      pickTimeSeconds: 45,
      draftDate: startTime,
      commissionerAuthUserId: users[0].authUserId,
      scoringRules: JSON.stringify({ receptions: 1, passingTouchdowns: 4 })
    }
  );

  // Create memberships and fantasy teams
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUE_MEMBERSHIPS,
      ID.unique(),
      {
        leagueId: league.$id,
        leagueName: league.leagueName,
        authUserId: u.authUserId,
        role: i === 0 ? 'COMMISSIONER' : 'MEMBER',
        status: 'ACTIVE',
        joinedAt: new Date().toISOString(),
        displayName: u.displayName,
      }
    );

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      ID.unique(),
      {
        leagueId: league.$id,
        leagueName: league.leagueName,
        ownerAuthUserId: u.authUserId,
        teamName: `${u.displayName} FC`,
        abbrev: u.displayName.slice(0,3).toUpperCase(),
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      }
    );
  }

  // Create draft doc with no orderJson (to let cron assign)
  const draft = await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.DRAFTS,
    ID.unique(),
    {
      leagueId: league.$id,
      leagueName: league.leagueName,
      gameMode: league.gameMode,
      selectedConference: league.selectedConference || null,
      maxTeams: Math.max(4, users.length),
      draftStatus: 'pre-draft',
      type: 'snake',
      currentRound: 0,
      currentPick: 0,
      maxRounds: 3,
      startTime,
      isMock: false,
      clockSeconds: 45,
      orderJson: JSON.stringify({})
    }
  );
  console.log('Seeded league:', league.$id, 'draft:', draft.$id, 'startTime:', startTime);
  try {
    const { writeFileSync, mkdirSync } = await import('node:fs');
    mkdirSync('scripts/dev', { recursive: true });
    writeFileSync('scripts/dev/.last-seed.json', JSON.stringify({ leagueId: league.$id, draftId: draft.$id, startTime }, null, 2));
    console.log('Wrote scripts/dev/.last-seed.json');
  } catch {}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


