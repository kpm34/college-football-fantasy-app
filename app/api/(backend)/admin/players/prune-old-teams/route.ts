import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type PlayerDoc = {
    $id: string;
    name?: string;
    position?: string;
    team?: string;
    conference?: string;
    draftable?: boolean;
    season?: number;
    fantasyPoints?: number;
    $updatedAt?: string;
};

function normalize(value?: string | null): string {
    return (value || '').trim().toLowerCase();
}

function computePriority(doc: PlayerDoc, currentSeason: number): number {
    let score = 0;
    if (Number(doc.season) === currentSeason) score += 1000;
    if (doc.draftable) score += 100;
    if (typeof doc.fantasyPoints === 'number') score += Math.max(0, Math.min(500, Math.round(doc.fantasyPoints)));
    if (doc.$updatedAt) {
        // newer updates slightly preferred
        try { score += Math.floor(new Date(doc.$updatedAt).getTime() / 1_000_000); } catch {}
    }
    return score;
}

export async function POST(request: NextRequest) {
    try {
        // Admin auth via current session + allowlist email
        const sessionCookie = request.cookies.get('appwrite-session')?.value;
        if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
        const meRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
            headers: {
                'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
                'X-Appwrite-Response-Format': '1.4.0',
                Cookie: cookieHeader,
            },
            cache: 'no-store',
        });
        if (!meRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        const me = await meRes.json();
        const adminEmail = process.env.ADMIN_EMAIL || 'kashpm2002@gmail.com';
        if ((me.email || '').toLowerCase() !== adminEmail.toLowerCase()) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
        }

        const body = await request.json().catch(() => ({}));
        const currentSeason: number = Number(body?.season) || new Date().getFullYear();
        const apply: boolean = Boolean(body?.apply ?? true);
        const hardDelete: boolean = Boolean(body?.delete ?? false);
        const limitParam: number = Math.max(50, Math.min(1000, Number(body?.pageSize) || 200));

        // Load all player docs in pages
        const all: PlayerDoc[] = [];
        let offset = 0;
        while (true) {
            const page = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLAYERS || 'college_players',
                [Query.limit(limitParam), Query.offset(offset)]
            );
            const docs = (page.documents || []) as PlayerDoc[];
            if (docs.length === 0) break;
            all.push(...docs);
            offset += docs.length;
            if (offset >= page.total) break;
        }

        // Group by name+position (ignore team)
        const groups = new Map<string, PlayerDoc[]>();
        for (const d of all) {
            const name = normalize(d.name);
            const pos = normalize(d.position);
            if (!name || !pos) continue;
            const key = `${name}|${pos}`;
            const arr = groups.get(key) || [];
            arr.push(d);
            groups.set(key, arr);
        }

        const toDisable: PlayerDoc[] = [];
        const kept: Record<string, string> = {};

        for (const [key, docs] of groups.entries()) {
            if (docs.length <= 1) continue;
            // Choose the best candidate to keep
            let winner: PlayerDoc | null = null;
            let best = -Infinity;
            for (const d of docs) {
                const pri = computePriority(d, currentSeason);
                if (pri > best) { best = pri; winner = d; }
            }
            // Disable all others (old-team duplicates)
            for (const d of docs) {
                if (!winner || d.$id === winner.$id) continue;
                // If they are on a different team or clearly older season, mark as not draftable
                if (Number(d.season) !== currentSeason || normalize(d.team) !== normalize(winner.team)) {
                    toDisable.push(d);
                }
            }
            if (winner) kept[key] = winner.$id;
        }

        let updated = 0;
        let deleted = 0;
        if (apply) {
            for (const d of toDisable) {
                try {
                    if (hardDelete) {
                        await databases.deleteDocument(
                            DATABASE_ID,
                            COLLECTIONS.PLAYERS || 'college_players',
                            d.$id
                        );
                        deleted += 1;
                    } else {
                        await databases.updateDocument(
                            DATABASE_ID,
                            COLLECTIONS.PLAYERS || 'college_players',
                            d.$id,
                            { draftable: false, retired_reason: 'old_team_duplicate' }
                        );
                        updated += 1;
                    }
                } catch {
                    // continue
                }
            }
        }

        return NextResponse.json({
            success: true,
            scanned: all.length,
            groups: groups.size,
            proposed: toDisable.length,
            applied: apply ? (hardDelete ? deleted : updated) : 0,
            mode: hardDelete ? 'delete' : 'disable',
            season: currentSeason,
        });
    } catch (error: any) {
        console.error('Prune old-team players error:', error);
        return NextResponse.json({ error: error.message || 'failed' }, { status: 500 });
    }
}


