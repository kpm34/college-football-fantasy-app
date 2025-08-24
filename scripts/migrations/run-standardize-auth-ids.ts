/*
  Migration: Standardize Auth IDs and Display Names (local runner)
  - Updates fantasy_teams.owner_client_id to Auth user id when it contains a clients doc id
  - Backfills fantasy_teams.display_name from Appwrite Users or clients
  - Aligns league_memberships.client_id to Auth user id and backfills display_name

  Usage:
    npx tsx scripts/migrations/run-standardize-auth-ids.ts --dry-run
    npx tsx scripts/migrations/run-standardize-auth-ids.ts
*/

import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { Client, Databases, Users, Query } from 'node-appwrite';

function loadEnv() {
  // Prefer production env pulled by Vercel CLI if present
  const vercelEnvPath = path.join(process.cwd(), '.vercel/.env.production.local');
  if (fs.existsSync(vercelEnvPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('dotenv').config({ path: vercelEnvPath });
  }
}

function getEnv(name: string, fallback = ''): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v.replace(/^"|"$/g, '');
}

async function main() {
  loadEnv();
  const DRY_RUN = process.argv.includes('--dry-run');

  const endpoint = getEnv('APPWRITE_ENDPOINT', getEnv('NEXT_PUBLIC_APPWRITE_ENDPOINT'));
  const projectId = getEnv('APPWRITE_PROJECT_ID', getEnv('NEXT_PUBLIC_APPWRITE_PROJECT_ID'));
  const apiKey = getEnv('APPWRITE_API_KEY');
  const databaseId = getEnv('DATABASE_ID', getEnv('APPWRITE_DATABASE_ID', getEnv('NEXT_PUBLIC_APPWRITE_DATABASE_ID')));

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);
  const users = new Users(client);

  const FANTASY_TEAMS = 'fantasy_teams';
  const LEAGUE_MEMBERSHIPS = 'league_memberships';
  const CLIENTS = 'clients';

  const results = {
    fantasyTeamsUpdated: 0,
    fantasyTeamOwnerIdsUpdated: 0,
    membershipsUpdated: 0,
    missingUsers: 0,
  };

  async function listAll(collectionId: string) {
    const pageSize = 100;
    let offset = 0;
    const docs: any[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const page = await databases.listDocuments(databaseId, collectionId, [
        Query.limit(pageSize),
        Query.offset(offset),
      ]);
      docs.push(...page.documents);
      if (page.documents.length < pageSize) break;
      offset += pageSize;
    }
    return docs;
  }

  // 1) fantasy_teams
  const teams = await listAll(FANTASY_TEAMS);
  for (const t of teams as any[]) {
    const currentOwner: string | undefined = t.owner_client_id || t.client_id || t.owner;
    if (!currentOwner || String(currentOwner).startsWith('BOT-')) continue;

    let desiredId: string | undefined = currentOwner;
    let display: string | undefined;

    // Try as Auth user id
    try {
      const u: any = await users.get(currentOwner);
      desiredId = u.$id;
      display = u.name || u.email || 'Unknown User';
    } catch {
      // Fallback: treat as clients doc id
      try {
        const clientDoc: any = await databases.getDocument(databaseId, CLIENTS, currentOwner);
        if (clientDoc?.auth_user_id) {
          desiredId = clientDoc.auth_user_id;
          display = clientDoc.display_name || clientDoc.email || 'Unknown User';
        }
      } catch {
        results.missingUsers++;
      }
    }

    const payload: Record<string, any> = {};
    if (desiredId && t.owner_client_id !== desiredId) {
      payload.owner_client_id = desiredId;
      results.fantasyTeamOwnerIdsUpdated++;
    }
    if (display && t.display_name !== display) {
      payload.display_name = display;
      results.fantasyTeamsUpdated++;
    }
    if (!DRY_RUN && Object.keys(payload).length > 0) {
      await databases.updateDocument(databaseId, FANTASY_TEAMS, t.$id, payload);
    }
  }

  // 2) league_memberships
  const memberships = await listAll(LEAGUE_MEMBERSHIPS);
  for (const m of memberships as any[]) {
    const currentClientId: string | undefined = m.client_id;
    if (!currentClientId) continue;

    let desiredId: string | undefined = currentClientId;
    let display: string | undefined = m.display_name;

    try {
      const u: any = await users.get(currentClientId);
      desiredId = u.$id;
      display = display || u.name || u.email || 'Unknown User';
    } catch {
      try {
        const clientDoc: any = await databases.getDocument(databaseId, CLIENTS, currentClientId);
        if (clientDoc?.auth_user_id) {
          desiredId = clientDoc.auth_user_id;
          display = display || clientDoc.display_name || clientDoc.email || 'Unknown User';
        }
      } catch {
        results.missingUsers++;
      }
    }

    const payload: Record<string, any> = {};
    if (desiredId && m.client_id !== desiredId) payload.client_id = desiredId;
    if (display && m.display_name !== display) payload.display_name = display;
    if (!DRY_RUN && Object.keys(payload).length > 0) {
      await databases.updateDocument(databaseId, LEAGUE_MEMBERSHIPS, m.$id, payload);
      results.membershipsUpdated++;
    } else if (Object.keys(payload).length > 0) {
      results.membershipsUpdated++;
    }
  }

  console.log(JSON.stringify({ ok: true, dryRun: DRY_RUN, results }, null, 2));
}

main().catch((err) => {
  console.error('Migration failed:', err?.message || err);
  process.exit(1);
});


