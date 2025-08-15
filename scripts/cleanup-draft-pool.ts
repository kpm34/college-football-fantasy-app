#!/usr/bin/env ts-node

import { Client, Databases, Query } from 'node-appwrite';
import fs from 'node:fs';
import path from 'node:path';

type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K';

function assertEnv() {
  const req = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
  const miss = req.filter((k) => !process.env[k]);
  if (miss.length) throw new Error(`Missing env: ${miss.join(', ')}`);
}

function cleanName(name: string): string {
  return name
    .replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '')
    .replace(/[^A-Za-z\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function readTeamsMap(): Record<string, string> {
  const file = path.join(process.cwd(), 'data/teams_map.json');
  if (!fs.existsSync(file)) return {};
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) as Record<string, string>; } catch { return {}; }
}

function invert(obj: Record<string, string>): Record<string, string> {
  const inv: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) inv[v] = k;
  return inv;
}

async function main() {
  assertEnv();
  const seasonArg = process.argv.find((a) => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const applyArg = process.argv.find((a) => a.startsWith('--apply='));
  const apply = applyArg ? ['1', 'true', 'yes'].includes(applyArg.split('=')[1].toLowerCase()) : false;
  const positions: Position[] = ['QB', 'RB', 'WR', 'TE', 'K'];

  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  const databases = new Databases(client);
  const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
  const playersCollection = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS || 'college_players';
  const modelInputsCollection = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MODEL_INPUTS || 'model_inputs';

  // Load depth_chart_json from model_inputs
  const mi = await databases.listDocuments(dbId, modelInputsCollection, [Query.equal('season', season), Query.limit(1)]);
  const doc: any = mi.documents?.[0];
  if (!doc) throw new Error(`model_inputs not found for season=${season}. Ingest depth first.`);
  let depth: any = doc.depth_chart_json;
  try { if (typeof depth === 'string') depth = JSON.parse(depth); } catch {}
  if (!depth || typeof depth !== 'object') throw new Error('depth_chart_json missing or invalid');

  // Build index: name|pos -> team_id (prefer rank 1 entries if multiple)
  const namePosToTeamId = new Map<string, string>();
  for (const [teamId, posMap] of Object.entries(depth)) {
    for (const [pos, arr] of Object.entries(posMap as any)) {
      if (!positions.includes(pos as Position)) continue;
      const list = (arr as any[]).slice().sort((a, b) => (a.pos_rank ?? 99) - (b.pos_rank ?? 99));
      for (const entry of list) {
        const key = `${cleanName(entry.player_name)}|${pos}`;
        if (!namePosToTeamId.has(key)) namePosToTeamId.set(key, teamId);
      }
    }
  }

  const teamMap = readTeamsMap();
  const idToTeamName = invert(teamMap);

  // Pass 1: scan players and decide updates/deletes
  const seenKey = new Map<string, any>(); // dedupe key -> keeper doc
  const duplicates: any[] = [];
  const updates: Array<{ id: string; data: any }> = [];
  const retire: string[] = [];
  let offset = 0; const pageSize = 200; let scanned = 0;

  while (true) {
    const page = await databases.listDocuments(dbId, playersCollection, [
      Query.equal('season', season),
      Query.limit(pageSize),
      Query.offset(offset),
    ]);
    const docs: any[] = page.documents || [];
    if (docs.length === 0) break;

    for (const doc of docs) {
      scanned++;
      const pos: Position | string = (doc.position || '').toUpperCase();
      if (!positions.includes(pos as Position)) continue;
      const nameKey = cleanName(doc.name || `${doc.first_name || ''} ${doc.last_name || ''}`);
      const dedupeKey = `${nameKey}|${(doc.team || '').toLowerCase()}|${(doc.position || '').toUpperCase()}`;

      // Dedupe: keep higher rating or first
      const existing = seenKey.get(dedupeKey);
      if (!existing) {
        seenKey.set(dedupeKey, doc);
      } else {
        const existingRating = Number(existing.rating ?? existing.ea_rating ?? 0);
        const currentRating = Number(doc.rating ?? doc.ea_rating ?? 0);
        if (currentRating > existingRating) {
          duplicates.push(existing);
          seenKey.set(dedupeKey, doc);
        } else {
          duplicates.push(doc);
        }
      }

      // Reconcile with depth (team + draftable)
      const depthKey = `${nameKey}|${(doc.position || '').toUpperCase()}`;
      const teamId = namePosToTeamId.get(depthKey);
      if (teamId) {
        const expectedTeam = idToTeamName[teamId] || doc.team;
        const patch: any = {};
        if (expectedTeam && expectedTeam !== doc.team) patch.team = expectedTeam;
        if (doc.draftable !== true) patch.draftable = true;
        if (Object.keys(patch).length) updates.push({ id: doc.$id, data: patch });
      } else {
        // Not present on depth → mark not draftable
        if (doc.draftable !== false) updates.push({ id: doc.$id, data: { draftable: false } });
      }
    }

    offset += docs.length;
    if (offset >= page.total) break;
  }

  // Apply changes if requested
  let updated = 0, deleted = 0;
  if (apply) {
    for (const u of updates) {
      try { await databases.updateDocument(dbId, playersCollection, u.id, u.data); updated++; } catch {}
    }
    for (const d of duplicates) {
      try { await databases.deleteDocument(dbId, playersCollection, d.$id); deleted++; } catch {}
    }
  }

  // Summary
  console.log(JSON.stringify({
    success: true,
    season,
    scanned,
    proposedUpdates: updates.length,
    duplicates: duplicates.length,
    appliedUpdates: apply ? updated : 0,
    deletedDuplicates: apply ? deleted : 0,
  }, null, 2));
}

main().catch((e) => { console.error('❌ Cleanup failed', e); process.exit(1); });


