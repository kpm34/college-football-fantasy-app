import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { leagueId: string } }) {
  const { leagueId } = params;
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [Query.equal('leagueId', leagueId), Query.limit(200)]
    );

    const teams = res.documents.map((t: any) => ({
      $id: t.$id,
      leagueId: t.leagueId,
      userId: t.ownerAuthUserId || t.owner || t.userId || '',
      name: t.teamName || t.name || 'Team',
      userName: t.userName || t.displayName || '',
      wins: t.wins ?? 0,
      losses: t.losses ?? 0,
      ties: t.ties ?? 0,
      pointsFor: t.pointsFor ?? 0,
      pointsAgainst: t.pointsAgainst ?? 0,
      players: t.players || '[]'
    }));

    return NextResponse.json({ success: true, teams });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load members' }, { status: 500 });
  }
}


