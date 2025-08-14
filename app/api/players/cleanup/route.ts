import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

type AnyDoc = Record<string, any> & { $id: string };

function normalizeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function normalizeYear(value: unknown): string {
  const raw = normalizeString(value).toUpperCase();
  if (!raw) return '';
  if (/^(FR|FRESH|FRESHMAN|1)$/i.test(raw)) return 'FR';
  if (/^(SO|SOPH|SOPHOMORE|2)$/i.test(raw)) return 'SO';
  if (/^(JR|JUNIOR|3)$/i.test(raw)) return 'JR';
  if (/^(SR|SENIOR|4)$/i.test(raw)) return 'SR';
  if (/^(GR|GRAD|GRADUATE|5)$/i.test(raw)) return 'GR';
  return raw;
}

function normalizePosition(value: unknown): string {
  const raw = normalizeString(value).toUpperCase();
  if (!raw) return '';
  const map: Record<string, string> = {
    QB: 'QB', QBS: 'QB',
    RB: 'RB', RBS: 'RB', HB: 'RB', TB: 'RB', FB: 'RB',
    WR: 'WR', WRS: 'WR',
    TE: 'TE', TES: 'TE',
    K: 'K', PK: 'K'
  };
  return map[raw] || raw;
}

function completenessScore(doc: AnyDoc): number {
  const fields = ['projection', 'adp', 'jersey', 'jerseyNumber', 'height', 'weight', 'year', 'conference', 'rotowireId'];
  return fields.reduce((acc, key) => acc + (doc[key] !== undefined && doc[key] !== null && String(doc[key]).toString().length > 0 ? 1 : 0), 0);
}

async function fetchAllPlayers(limit = 100): Promise<AnyDoc[]> {
  const items: AnyDoc[] = [];
  let cursor: string | null = null;
  // Order by $id for stable cursor pagination
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const queries: string[] = [Query.orderAsc('$id'), Query.limit(limit)];
    if (cursor) queries.push(Query.cursorAfter(cursor));
    const page = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COLLEGE_PLAYERS, queries as any);
    items.push(...(page.documents as AnyDoc[]));
    if (page.documents.length < limit) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }
  return items;
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const apply = url.searchParams.get('apply') === 'true';

    // 1) Load all players
    const players = await fetchAllPlayers(100);

    // 2) Deduplicate by cfbd_id first
    const byCfbd: Map<string, AnyDoc[]> = new Map();
    const noCfbd: AnyDoc[] = [];
    for (const p of players) {
      const cfbdId = normalizeString(p.cfbd_id || p.cfbdId);
      if (cfbdId) {
        const arr = byCfbd.get(cfbdId) || [];
        arr.push(p);
        byCfbd.set(cfbdId, arr);
      } else {
        noCfbd.push(p);
      }
    }

    const toDelete: string[] = [];
    const toUpdate: Array<{ id: string; data: Record<string, any> }> = [];

    for (const [, docs] of byCfbd) {
      if (docs.length <= 1) continue;
      // keep the most complete document
      const sorted = [...docs].sort((a, b) => completenessScore(b) - completenessScore(a));
      const keep = sorted[0];
      const duplicates = sorted.slice(1);
      for (const d of duplicates) toDelete.push(d.$id);
      // Standardize kept fields too
      const normData = {
        team: normalizeString(keep.team),
        position: normalizePosition(keep.position),
        year: normalizeYear(keep.year)
      };
      // Only push update if changes are meaningful
      if (normData.team !== keep.team || normData.position !== keep.position || normData.year !== keep.year) {
        toUpdate.push({ id: keep.$id, data: normData });
      }
    }

    // 3) Deduplicate remaining by name+team+position+year
    const buckets: Map<string, AnyDoc[]> = new Map();
    for (const p of noCfbd) {
      const key = [
        normalizeString(p.name || `${p.first_name || ''} ${p.last_name || ''}`),
        normalizeString(p.team),
        normalizePosition(p.position),
        normalizeYear(p.year)
      ].join('|');
      const arr = buckets.get(key) || [];
      arr.push(p);
      buckets.set(key, arr);
    }

    for (const [, docs] of buckets) {
      if (docs.length <= 1) continue;
      const sorted = [...docs].sort((a, b) => completenessScore(b) - completenessScore(a));
      const keep = sorted[0];
      const duplicates = sorted.slice(1);
      for (const d of duplicates) toDelete.push(d.$id);
      const normData = {
        team: normalizeString(keep.team),
        position: normalizePosition(keep.position),
        year: normalizeYear(keep.year)
      };
      if (normData.team !== keep.team || normData.position !== keep.position || normData.year !== keep.year) {
        toUpdate.push({ id: keep.$id, data: normData });
      }
    }

    // 4) Normalize everyone (ensure grouping fields consistent)
    for (const p of players) {
      const normData = {
        team: normalizeString(p.team),
        position: normalizePosition(p.position),
        year: normalizeYear(p.year)
      };
      if (normData.team !== p.team || normData.position !== p.position || normData.year !== p.year) {
        toUpdate.push({ id: p.$id, data: normData });
      }
    }

    // De-dup and collapse updates by id
    const updateMap = new Map<string, Record<string, any>>();
    for (const u of toUpdate) {
      updateMap.set(u.id, { ...(updateMap.get(u.id) || {}), ...u.data });
    }

    // Apply changes if requested
    let deleted = 0;
    let updated = 0;
    if (apply) {
      // Deletes
      for (const id of toDelete) {
        try {
          await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COLLEGE_PLAYERS, id);
          deleted++;
        } catch (err) {
          // continue best-effort
        }
      }
      // Updates
      for (const [id, data] of updateMap.entries()) {
        try {
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.COLLEGE_PLAYERS, id, data);
          updated++;
        } catch (err) {
          // continue best-effort
        }
      }
    }

    // 5) Summary with grouping preview
    const sampleSorted = [...players]
      .map(p => ({
        school: normalizeString(p.team),
        position: normalizePosition(p.position),
        year: normalizeYear(p.year),
        name: normalizeString(p.name || `${p.first_name || ''} ${p.last_name || ''}`)
      }))
      .sort((a, b) => a.school.localeCompare(b.school) || a.position.localeCompare(b.position) || a.year.localeCompare(b.year));

    return NextResponse.json({
      success: true,
      dryRun: !apply,
      totals: {
        scanned: players.length,
        duplicatesFound: toDelete.length,
        toUpdate: updateMap.size,
        deleted,
        updated
      },
      note: 'Sorting is available via orderAsc on team, position, year at query time. Data normalized to support grouping: school → position → year.',
      sampleOrderPreview: sampleSorted.slice(0, 15)
    });
  } catch (error: any) {
    console.error('Players cleanup error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}


