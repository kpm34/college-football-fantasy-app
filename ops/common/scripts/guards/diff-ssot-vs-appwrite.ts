#!/usr/bin/env tsx

/**
 * Diff SSOT vs Appwrite (live)
 * - Lists collections from Appwrite via API
 * - Parses SSOT COLLECTIONS from schema/zod-schema.ts
 * - Prints JSON diff summary (counts and differences)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Client, Databases } from 'node-appwrite';

function sanitizeApiKey(raw: string | undefined): string {
  if (!raw) return '';
  return raw.replace(/^"|"$/g, '').replace(/\r?\n$/g, '');
}

async function listAppwriteCollections(): Promise<{ databaseId: string; ids: string[] }> {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy';
  const apiKey = sanitizeApiKey(process.env.APPWRITE_API_KEY);

  if (!apiKey) {
    throw new Error('APPWRITE_API_KEY not set in environment');
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  const res: any = await databases.listCollections(databaseId as any);
  const list = (res.collections || res.documents || []).map((c: any) => c.$id) as string[];

  return { databaseId, ids: list };
}

function parseSsotCollections(): { path: string; ids: string[] } {
  const ssotPath = join(process.cwd(), 'schema', 'zod-schema.ts');
  if (!existsSync(ssotPath)) {
    throw new Error(`SSOT file not found at ${ssotPath}`);
  }
  const content = readFileSync(ssotPath, 'utf-8');

  const blockMatch = content.match(/export\s+const\s+COLLECTIONS\s*=\s*\{([\s\S]*?)\}\s*as\s*const;/);
  const ids = new Set<string>();
  if (blockMatch) {
    const block = blockMatch[1];
    const pairs = block.match(/[A-Z_]+:\s*['"][a-z0-9_]+['"]/gi) || [];
    for (const pair of pairs) {
      const m = pair.match(/([A-Z_]+):\s*['"]([a-z0-9_]+)['"]/i);
      if (m) ids.add(m[2]);
    }
  }
  return { path: ssotPath, ids: Array.from(ids) };
}

async function main() {
  try {
    const live = await listAppwriteCollections();
    const ssot = parseSsotCollections();

    const liveSet = new Set(live.ids);
    const ssotSet = new Set(ssot.ids);

    const appwriteOnly = live.ids.filter(id => !ssotSet.has(id)).sort();
    const ssotOnly = ssot.ids.filter(id => !liveSet.has(id)).sort();
    const intersection = ssot.ids.filter(id => liveSet.has(id)).sort();

    const result = {
      databaseId: live.databaseId,
      counts: {
        appwrite: live.ids.length,
        ssot: ssot.ids.length,
        intersection: intersection.length,
        appwriteOnly: appwriteOnly.length,
        ssotOnly: ssotOnly.length,
      },
      appwriteOnly,
      ssotOnly,
      intersection,
      notes: [
        'Add appwriteOnly ids to SSOT (or explicitly deprecate/alias).',
        'Remove or migrate ssotOnly ids (if not present live) or create them via sync script.',
      ],
    };

    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('❌ Diff failed:', err?.message || err);
    process.exit(1);
  }
}

main();


