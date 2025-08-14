/**
 * One-time migration: Backfill leagues.commissioner from leagues.commissionerId
 * and remove the legacy commissionerId attribute from existing documents.
 *
 * Usage:
 *   npx ts-node scripts/migrations/2025-08-14-backfill-commissioner.ts
 * or add an npm script and run via Vercel/locally with APPWRITE_API_KEY set.
 */

import { Client, Databases, Query } from 'node-appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
const apiKey = process.env.APPWRITE_API_KEY!;

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY. Aborting.');
  process.exit(1);
}

async function main(): Promise<void> {
  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
  const databases = new Databases(client);

  let totalUpdated = 0;
  let offset = 0;
  const limit = 100;

  while (true) {
    const batch = await databases.listDocuments(databaseId, 'leagues', [Query.limit(limit), Query.offset(offset)]);
    if (batch.documents.length === 0) break;

    for (const doc of batch.documents as any[]) {
      // If commissioner is already present, skip
      const commissioner = doc.commissioner || doc.commissioner_id;
      const commissionerId = doc.commissionerId || doc.commissioner_id;

      if (!commissioner && commissionerId) {
        await databases.updateDocument(databaseId, 'leagues', doc.$id, {
          commissioner: commissionerId,
          commissionerId: null,
        });
        totalUpdated += 1;
        continue;
      }

      // If both exist but differ, prefer commissioner, log inconsistency
      if (commissioner && commissionerId && commissioner !== commissionerId) {
        console.warn(`[warn] Inconsistent commissioner on league ${doc.$id}: commissioner=${commissioner} commissionerId=${commissionerId}. Keeping commissioner.`);
        await databases.updateDocument(databaseId, 'leagues', doc.$id, { commissionerId: null });
        totalUpdated += 1;
        continue;
      }

      // If commissioner exists and commissionerId exists, strip legacy field
      if (commissioner && commissionerId) {
        await databases.updateDocument(databaseId, 'leagues', doc.$id, { commissionerId: null });
        totalUpdated += 1;
      }
    }

    offset += batch.documents.length;
  }

  console.log(`Backfill complete. Updated ${totalUpdated} league documents.`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});


