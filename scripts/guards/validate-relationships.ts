import { Client, Databases, Query } from 'node-appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-generated';

async function main() {
  const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
  const project = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
  const apiKey = (process.env.APPWRITE_API_KEY || '').replace(/^"|"$/g, '');
  if (!apiKey) throw new Error('APPWRITE_API_KEY is required');

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
  const databases = new Databases(client);

  const errors: string[] = [];

  // 1) Each ACTIVE league_membership should have a fantasy_team
  const memberships = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUE_MEMBERSHIPS, [Query.equal('status','ACTIVE'), Query.limit(1000)]);
  for (const m of memberships.documents) {
    const leagueId = (m as any).leagueId;
    const authUserId = (m as any).authUserId;
    const teams = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, [Query.equal('leagueId', leagueId), Query.equal('ownerAuthUserId', authUserId), Query.limit(1)]);
    if ((teams.total || teams.documents.length) === 0) {
      errors.push(`Missing fantasy_team for league=${leagueId} user=${authUserId}`);
    }
  }

  // 2) For each draft pick, ensure roster_slots contains player for that fantasy team
  const picks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [Query.limit(1000)]);
  for (const p of picks.documents) {
    const fantasyTeamId = (p as any).userId;
    const playerId = (p as any).playerId;
    const slots = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ROSTER_SLOTS, [Query.equal('fantasyTeamId', fantasyTeamId), Query.equal('playerId', playerId), Query.limit(1)]);
    if ((slots.total || slots.documents.length) === 0) {
      errors.push(`Missing roster_slot for team=${fantasyTeamId} player=${playerId}`);
    }
  }

  if (errors.length > 0) {
    console.error('Relationship validation errors:');
    errors.forEach(e => console.error(' - ' + e));
    process.exit(1);
  }

  console.log('✔ Relationships validated');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


