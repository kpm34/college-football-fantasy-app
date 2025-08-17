import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Position = 'QB'|'RB'|'WR'|'TE'|'K';
const FANTASY_POS: Position[] = ['QB','RB','WR','TE','K'];

function cleanName(name?: string): string {
  return (name || '')
    .replace(/\b(Jr\.?|Sr\.?|II|III|IV|V)\b/gi, '')
    .replace(/[^A-Za-z\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function loadNflRosters(): Promise<Map<string, { team: string; pos?: string }>> {
  // Build a normalized name -> {team, pos} index from ESPN public APIs
  const index = new Map<string, { team: string; pos?: string }>();
  try {
    // 1) Get NFL team list
    const teamsData = await fetchJson('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams?limit=100');
    const teams: Array<any> = (teamsData?.sports?.[0]?.leagues?.[0]?.teams || []).map((t: any) => t.team || t);

    // 2) For each team, try to fetch roster via the most stable endpoints
    for (const t of teams) {
      const teamId = t.id || t.team?.id;
      const teamName = t.displayName || t.name || t.nickname || t.location || `NFL-${teamId}`;
      if (!teamId) continue;

      let roster: any[] | null = null;
      // Try dedicated roster endpoint first
      try {
        const r = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}/roster`);
        // NCAA-style schema uses athletes
        roster = (r?.athletes || []).flatMap((grp: any) => grp?.items || []);
      } catch {
        // Fallback: team endpoint with roster enabled
        try {
          const r = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${teamId}?enable=roster`);
          roster = (r?.team?.athletes || []).flatMap((grp: any) => grp?.items || []);
        } catch {
          roster = null;
        }
      }

      if (!Array.isArray(roster)) continue;
      for (const a of roster) {
        const fullName = a?.fullName || a?.displayName || `${a?.firstName || ''} ${a?.lastName || ''}`.trim();
        const pos = a?.position?.abbreviation || a?.position?.name || a?.position || undefined;
        const key = cleanName(fullName);
        if (key) index.set(key, { team: teamName, pos });
      }
    }
  } catch (e) {
    // If ESPN is unavailable, return an empty index; caller can still run graduation by season heuristic
    return index;
  }
  return index;
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Allow CRON secret or admin session
  const headerSecret = request.headers.get('x-cron-secret') || request.headers.get('X-Cron-Secret');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && headerSecret === cronSecret) return true;

  const sessionCookie = request.cookies.get('appwrite-session')?.value;
  if (!sessionCookie) return false;
  const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
  const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
    headers: {
      'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0',
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  });
  if (!meRes.ok) return false;
  const me = await meRes.json();
  const adminEmail = (process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com').toLowerCase();
  return (me.email || '').toLowerCase() === adminEmail;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const apply: boolean = Boolean(body?.apply); // default: dry-run
    const hardDelete: boolean = Boolean(body?.delete); // optional hard delete
    const minSeasonForActive = Number(body?.season) || new Date().getFullYear();
    const pageSize = Math.max(100, Math.min(500, Number(body?.pageSize) || 200));
    const includeCount = Math.max(0, Math.min(1000, Number(body?.include) || 0));

    // Build NFL roster index (name -> team)
    const nflIndex = await loadNflRosters();

    // Scan SEC players from our database
    const matches: Array<{ id: string; name: string; position: string; team: string; season: number; nflTeam: string }> = [];
    const graduatedOnly: Array<{ id: string; name: string; position: string; team: string; season: number }> = [];

    let offset = 0;
    while (true) {
      const page = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PLAYERS || 'college_players',
        [
          Query.equal('conference', 'SEC'),
          Query.limit(pageSize),
          Query.offset(offset)
        ]
      );
      const docs: any[] = page.documents || [];
      if (docs.length === 0) break;

      for (const d of docs) {
        const pos = String(d.position || '').toUpperCase();
        if (!FANTASY_POS.includes(pos as Position)) continue;

        const nm = cleanName(d.name || `${d.first_name || ''} ${d.last_name || ''}`);
        const nfl = nm ? nflIndex.get(nm) : undefined;
        const season = Number(d.season) || minSeasonForActive;

        if (nfl) {
          matches.push({
            id: d.$id,
            name: d.name,
            position: pos,
            team: d.team,
            season,
            nflTeam: nfl.team
          });
        } else if (season < minSeasonForActive) {
          // Consider graduated (older season) even if not found on NFL roster index
          graduatedOnly.push({ id: d.$id, name: d.name, position: pos, team: d.team, season });
        }
      }

      offset += docs.length;
      if (offset >= page.total) break;
    }

    let retired = 0;
    let deleted = 0;
    if (apply) {
      const targets = [...matches.map(x => x.id), ...graduatedOnly.map(x => x.id)];
      for (const id of targets) {
        try {
          if (hardDelete) {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PLAYERS || 'college_players', id);
            deleted++;
          } else {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.PLAYERS || 'college_players',
              id,
              { draftable: false, retired_reason: 'nfl_or_graduated' }
            );
            retired++;
          }
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      nflMatches: matches.length,
      graduatedOnly: graduatedOnly.length,
      proposed: matches.length + graduatedOnly.length,
      appliedRetired: retired,
      deleted,
      sampleMatches: matches.slice(0, 20),
      sampleGraduated: graduatedOnly.slice(0, 20),
      matchesList: includeCount ? matches.slice(0, includeCount) : undefined,
      graduatedList: includeCount ? graduatedOnly.slice(0, includeCount) : undefined
    });
  } catch (error: any) {
    console.error('survey-sec-nfl error:', error);
    return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
  }
}


