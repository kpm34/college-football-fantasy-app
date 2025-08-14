import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export async function POST(request: NextRequest) {
  try {
    const { leagueId } = await request.json();
    if (!leagueId) {
      return NextResponse.json({ error: 'leagueId required' }, { status: 400 });
    }

    // Load existing TEAMS for the league
    const teamsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TEAMS,
      [Query.equal('leagueId', leagueId)]
    );
    const existingUserIds = new Set(teamsRes.documents.map((d: any) => d.userId));

    // Load ROSTERS fallback
    const rostersRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('leagueId', leagueId)]
    );

    let created = 0;
    for (const r of rostersRes.documents as any[]) {
      const userId = r.userId || r.owner;
      if (!userId || existingUserIds.has(userId)) continue;

      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.TEAMS,
          ID.unique(),
          {
            name: r.teamName || r.name || 'Team',
            userId,
            leagueId,
            wins: r.wins ?? 0,
            losses: r.losses ?? 0,
            pointsFor: r.pointsFor ?? r.points ?? 0,
            pointsAgainst: r.pointsAgainst ?? 0,
            players: r.players ?? null,
          }
        );
        created++;
      } catch (e) {
        // continue on individual errors
      }
    }

    return NextResponse.json({ migrated: created });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to migrate', details: String(error) }, { status: 500 });
  }
}


