#!/usr/bin/env tsx

/**
 * Normalize EA ratings into one CSV per conference with schema:
 * team,slot,player,ovr,spd,agi
 *
 * Sources handled:
 * - Row-wise CSV: Team,Slot,Player,OVR,SPD,AGI (may include a leading index column)
 * - Wide CSV (SEC): Team,QB1,QB1_OVR,QB1_SPD,QB1_AGI,...,TE2,TE2_OVR,TE2_SPD,TE2_AGI
 * - Files may be missing extensions; treat as CSV
 */

import fs from 'node:fs';
import path from 'node:path';

type Row = { team: string; slot: string; player: string; ovr?: string|number; spd?: string|number; agi?: string|number };

function parseCSV(text: string): string[][] {
  // Simple CSV split; assumes no embedded commas in fields (true for our inputs)
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  return lines.map(l => l.split(',').map(x => x.trim()));
}

function normalizeHeader(head: string[]): string[] {
  // Drop leading blank/index column if present
  if (head[0] === '' || head[0] === undefined) head = head.slice(1);
  return head.map(h => (h || '').toLowerCase());
}

function toRowsRowWise(csv: string[][]): Row[] {
  let [head, ...rows] = [csv[0], ...csv.slice(1)];
  const header = normalizeHeader(head);
  const indexOf = (name: string, alts: string[] = []) => {
    const idx = header.indexOf(name.toLowerCase());
    if (idx >= 0) return idx;
    for (const a of alts) {
      const j = header.indexOf(a.toLowerCase());
      if (j >= 0) return j;
    }
    return -1;
  };
  const iTeam = indexOf('team', ['school']);
  const iSlot = indexOf('slot');
  const iPlayer = indexOf('player', ['name','player_name']);
  const iOvr = indexOf('ovr', ['overall']);
  const iSpd = indexOf('spd', ['speed']);
  const iAgi = indexOf('agi', ['acc','acceleration']);
  const out: Row[] = [];
  for (const r of rows) {
    // Handle potential leading index col
    const row = r.length === header.length ? r : r.slice(r.length - header.length);
    const team = row[iTeam]?.trim();
    const slot = row[iSlot]?.trim();
    const player = row[iPlayer]?.trim();
    if (!team || !player) continue;
    out.push({ team, slot: slot || '', player, ovr: row[iOvr], spd: row[iSpd], agi: row[iAgi] });
  }
  return out;
}

function toRowsWide(csv: string[][]): Row[] {
  let [head, ...rows] = [csv[0], ...csv.slice(1)];
  const header = normalizeHeader(head);
  const iTeam = header.indexOf('team') >= 0 ? header.indexOf('team') : header.indexOf('school');
  const slots = ['QB1','QB2','RB1','RB2','RB3','WR1','WR2','WR3','WR4','TE1','TE2'];
  const out: Row[] = [];
  for (const r of rows) {
    const row = r.length === header.length ? r : r.slice(r.length - header.length);
    const team = row[iTeam]?.trim();
    if (!team) continue;
    for (const s of slots) {
      const iName = header.indexOf(s.toLowerCase());
      if (iName < 0) continue;
      const name = row[iName]?.trim();
      if (!name) continue;
      const iOvr = header.indexOf(`${s.toLowerCase()}_ovr`);
      const iSpd = header.indexOf(`${s.toLowerCase()}_spd`);
      const iAgi = header.indexOf(`${s.toLowerCase()}_agi`);
      out.push({ team, slot: s, player: name, ovr: iOvr>=0?row[iOvr]:undefined, spd: iSpd>=0?row[iSpd]:undefined, agi: iAgi>=0?row[iAgi]:undefined });
    }
  }
  return out;
}

function writeCSV(rows: Row[], outPath: string): void {
  const header = 'team,slot,player,ovr,spd,agi\n';
  const body = rows.map(r => [r.team, r.slot || '', r.player, r.ovr ?? '', r.spd ?? '', r.agi ?? ''].join(',')).join('\n');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, header + body);
}

function normalizeOne(srcPath: string, outPath: string): number {
  const text = fs.readFileSync(srcPath, 'utf8');
  const csv = parseCSV(text);
  const headLower = normalizeHeader(csv[0]);
  const isWide = headLower.some(h => /^(qb|rb|wr|te)\d$/.test(h));
  const rows = isWide ? toRowsWide(csv) : toRowsRowWise(csv);
  writeCSV(rows, outPath);
  return rows.length;
}

function main() {
  const seasonArg = process.argv.find(a => a.startsWith('--season='));
  const season = seasonArg ? Number(seasonArg.split('=')[1]) : 2025;
  const outDir = path.join(process.cwd(), 'data', 'imports', 'ea', String(season));
  const sources: Array<[string,string]> = [
    ['ACC', path.join('data','imports','EA_College_Football_Ratings_ACC')],
    ['Big_12', path.join('data','imports','EA_College_Football_Ratings_Big_12')],
    ['Big_Ten', path.join('data','imports','EA_College_Football_Ratings_Big_Ten')],
    ['SEC', path.join('data','imports','EA_College_Football_SEC.csv')],
  ];
  let total = 0;
  for (const [conf, src] of sources) {
    if (!fs.existsSync(src)) {
      console.warn(`[skip] ${conf}: source not found at ${src}`);
      continue;
    }
    const outPath = path.join(outDir, `EA_${conf}.csv`);
    try {
      const n = normalizeOne(src, outPath);
      total += n;
      console.log(`[ok] ${conf}: wrote ${n} rows → ${outPath}`);
    } catch (e) {
      console.error(`[error] ${conf}:`, e);
    }
  }
  if (total === 0) {
    console.warn('No EA rows were written. Please verify sources exist.');
  }
}

if (require.main === module) {
  main();
}


