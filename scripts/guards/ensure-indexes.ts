import { Client, Databases } from 'node-appwrite';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-generated';

type IndexSpec = {
  key: string;
  type: 'key' | 'unique' | 'fulltext';
  attributes: string[];
  orders?: ('ASC'|'DESC')[];
};

async function ensureIndex(databases: Databases, collectionId: string, desired: IndexSpec) {
  const col = await databases.getCollection(DATABASE_ID, collectionId);
  const existing = (col as any).indexes || [];
  const found = existing.find((idx: any) => idx.key === desired.key);
  if (found) {
    // Compare attributes & type; if equal, skip; we will not drop/replace to avoid downtime
    const sameType = String(found.type).toLowerCase() === desired.type;
    const sameAttrs = Array.isArray(found.attributes) && desired.attributes.length === found.attributes.length && desired.attributes.every((a, i) => a === found.attributes[i]);
    if (sameType && sameAttrs) {
      console.log(`✓ ${collectionId}.${desired.key} already exists`);
      return;
    }
    console.log(`! ${collectionId}.${desired.key} exists with different shape; skipping destructive change`);
    return;
  }
  // Create index
  console.log(`+ Creating ${collectionId}.${desired.key}`);
  await databases.createIndex(
    DATABASE_ID,
    collectionId,
    desired.key,
    desired.type,
    desired.attributes,
    desired.orders || []
  );
}

async function main() {
  const endpointRaw = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
  const projectRaw = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
  const apiKey = (process.env.APPWRITE_API_KEY || '').replace(/^"|"$/g, '');
  const endpoint = endpointRaw.replace(/^"|"$/g, '');
  const project = projectRaw.replace(/^"|"$/g, '');
  if (!apiKey) throw new Error('APPWRITE_API_KEY is required');

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
  const databases = new Databases(client);

  // Draft States: deadline scan and unique draftId
  await ensureIndex(databases, COLLECTIONS.DRAFT_STATES, {
    key: 'deadline_scan_idx', type: 'key', attributes: ['draftStatus','deadlineAt'], orders: ['ASC','ASC']
  });
  await ensureIndex(databases, COLLECTIONS.DRAFT_STATES, {
    key: 'draft_unique_idx', type: 'unique', attributes: ['draftId']
  });

  // Draft Picks: ordered picks by league
  await ensureIndex(databases, COLLECTIONS.DRAFT_PICKS, {
    key: 'league_pick_idx', type: 'key', attributes: ['leagueId','pick'], orders: ['ASC','ASC']
  });

  // Drafts: convenience lookups
  await ensureIndex(databases, COLLECTIONS.DRAFTS, {
    key: 'league_idx', type: 'key', attributes: ['leagueId']
  });
  await ensureIndex(databases, COLLECTIONS.DRAFTS, {
    key: 'status_start_idx', type: 'key', attributes: ['draftStatus','startTime'], orders: ['ASC','ASC']
  });

  // Fantasy Teams: owner lookups and unique constraint
  await ensureIndex(databases, COLLECTIONS.FANTASY_TEAMS, {
    key: 'owner_teams_idx', type: 'key', attributes: ['ownerAuthUserId','leagueId'], orders: ['ASC','ASC']
  });
  await ensureIndex(databases, COLLECTIONS.FANTASY_TEAMS, {
    key: 'league_owner_unique_idx', type: 'unique', attributes: ['leagueId','ownerAuthUserId']
  });

  console.log('✔ Index ensure complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


