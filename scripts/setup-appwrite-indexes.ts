/*
  Script: Setup critical Appwrite indexes.
  Usage: ts-node scripts/setup-appwrite-indexes.ts
*/
import 'dotenv/config';
import { Client, Databases } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const apiKey = process.env.APPWRITE_API_KEY as string;
const databaseId = process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';

async function ensureIndex(databases: Databases, collectionId: string, key: string, attributes: string[], type: 'key' | 'unique' = 'key', orders?: ('ASC'|'DESC')[]) {
  try {
    const res = await databases.getCollection(databaseId, collectionId);
    const exists = res.indexes?.some((i: any) => i.key === key);
    if (exists) {
      console.log(`Index exists: ${collectionId}.${key}`);
      return;
    }
    await databases.createIndex(databaseId, collectionId, key, type, attributes, orders);
    console.log(`Created index: ${collectionId}.${key}`);
  } catch (e) {
    console.error(`Failed to ensure index for ${collectionId}.${key}`, e);
  }
}

async function main() {
  if (!apiKey) throw new Error('APPWRITE_API_KEY is required');
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  // Leagues
  await ensureIndex(databases, 'leagues', 'commissioner_idx', ['commissionerId']);
  await ensureIndex(databases, 'leagues', 'status_idx', ['status']);

  // Teams
  await ensureIndex(databases, 'teams', 'league_idx', ['leagueId']);
  await ensureIndex(databases, 'teams', 'user_idx', ['userId']);
  await ensureIndex(databases, 'teams', 'league_user_idx', ['leagueId', 'userId'], 'unique');

  // Rosters
  await ensureIndex(databases, 'rosters', 'league_user_idx', ['leagueId', 'userId'], 'key');

  // College players
  await ensureIndex(databases, 'college_players', 'rating_desc', ['rating'], 'key', ['DESC']);
  await ensureIndex(databases, 'college_players', 'conference_idx', ['conference']);
  await ensureIndex(databases, 'college_players', 'position_idx', ['position']);
  await ensureIndex(databases, 'college_players', 'draftable_idx', ['draftable']);

  console.log('Index setup complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



