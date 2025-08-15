#!/usr/bin/env ts-node
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { Query, Client, Databases } from 'node-appwrite';

function getDatabases(): { databases: Databases; dbId: string } {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
  const databases = new Databases(client);
  const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
  return { databases, dbId };
}

interface PlayerRow {
  id: string;
  name: string;
  position: string;
  team: string;
  conference?: string;
  season?: number;
  cfbd_id?: string;
  rating?: number;
  draftable?: boolean;
  power_4?: boolean;
}

function toCsv(rows: PlayerRow[]): string {
  const headers = ['id','name','position','team','conference','season','cfbd_id','rating','draftable','power_4'];
  const escape = (v: any) => {
    const s = v === undefined || v === null ? '' : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => escape((r as any)[h])).join(','))].join('\n');
}

async function fetchAllPlayers(season: number): Promise<PlayerRow[]> {
  const { databases, dbId } = getDatabases();
  const rows: PlayerRow[] = [];
  let offset = 0; const pageSize = 200;
  while (true) {
    const page = await databases.listDocuments(dbId, 'college_players', [
      Query.equal('season', season),
      Query.limit(pageSize),
      Query.offset(offset)
    ]);
    const docs: any[] = page.documents || [];
    if (docs.length === 0) break;
    for (const d of docs) {
      rows.push({
        id: d.$id,
        name: d.name || `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim(),
        position: d.position,
        team: d.team,
        conference: d.conference,
        season: Number(d.season),
        cfbd_id: d.cfbd_id,
        rating: Number(d.rating ?? d.ea_rating ?? 0) || undefined,
        draftable: Boolean(d.draftable),
        power_4: Boolean(d.power_4)
      });
    }
    offset += docs.length;
    if (offset >= page.total) break;
  }
  return rows;
}

async function main() {
  const seasonArg = process.argv.find(a => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : new Date().getFullYear();
  const outDir = path.join(process.cwd(), 'exports');
  fs.mkdirSync(outDir, { recursive: true });
  const rows = await fetchAllPlayers(season);
  fs.writeFileSync(path.join(outDir, `college_players_${season}.json`), JSON.stringify(rows, null, 2));
  fs.writeFileSync(path.join(outDir, `college_players_${season}.csv`), toCsv(rows));
  console.log(`✅ Exported ${rows.length} players to exports/college_players_${season}.{json,csv}`);
}

main().catch((e) => { console.error('❌ Export failed:', e); process.exit(1); });


