import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await context.params;
    
    if (!leagueId) {
      return NextResponse.json(
        { success: false, error: 'League ID is required' },
        { status: 400 }
      );
    }

    // Fetch all rosters/teams in this league
    const rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [
        Query.equal('leagueId', leagueId),
        Query.limit(100)
      ]
    );

    // Map to consistent format
    const teams = rosters.documents.map((doc: any) => ({
      $id: doc.$id,
      leagueId: doc.leagueId,
      userId: doc.userId || doc.owner || '',
      name: doc.teamName || doc.name || 'Team',
      userName: doc.userName,
      email: doc.email,
      wins: doc.wins ?? 0,
      losses: doc.losses ?? 0,
      ties: doc.ties ?? 0,
      points: doc.points ?? doc.pointsFor ?? 0,
      pointsFor: doc.pointsFor ?? doc.points ?? 0,
      pointsAgainst: doc.pointsAgainst ?? 0,
      players: doc.players,
      isActive: doc.isActive ?? true,
      status: doc.status,
    }));

    return NextResponse.json({
      success: true,
      teams,
      count: teams.length,
      activeCount: teams.filter(t => t.isActive !== false).length
    });
  } catch (error) {
    console.error('Error fetching league members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch league members' },
      { status: 500 }
    );
  }
}