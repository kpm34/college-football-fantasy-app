import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, serverUsers, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
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
        Query.equal('league_id', leagueId),
        Query.limit(100)
      ]
    );

    // Fetch memberships to leverage per-league member display names
    let memberships: any = { documents: [] };
    try {
      memberships = await databases.listDocuments(
        DATABASE_ID,
        'league_memberships',
        [
          Query.equal('league_id', leagueId),
          Query.equal('status', 'active'),
          Query.limit(200)
        ]
      );
    } catch {}

    // Resolve owner display names using Appwrite Users service
    const uniqueUserIds = Array.from(
      new Set(
        (rosters.documents || [])
          .map((d: any) => d.owner_client_id || d.client_id || d.owner)
          .filter(Boolean)
      )
    );
    const idToName = new Map<string, string>();
    const membershipName = new Map<string, string>();

    // Build membership display name map (client_id -> display_name)
    try {
      for (const m of memberships.documents || []) {
        if (m?.client_id && m?.display_name) {
          membershipName.set(String(m.client_id), String(m.display_name));
        }
      }
    } catch {}
    await Promise.all(
      uniqueUserIds.map(async (uid) => {
        try {
          const u: any = await serverUsers.get(uid as string);
          idToName.set(uid as string, u.name || u.email || 'Unknown');
        } catch {
          // Fallback to unknown if user lookup fails
          idToName.set(uid as string, 'Unknown');
        }
      })
    );

    // Map to consistent format with resolved manager name
    const teams = rosters.documents.map((doc: any) => {
      const ownerId = doc.owner_client_id || doc.client_id || doc.owner || '';
      const managerName =
        doc.display_name ||
        membershipName.get(ownerId) ||
        idToName.get(ownerId) ||
        doc.userName ||
        'Unknown';
      return {
        $id: doc.$id,
        leagueId: doc.league_id,
        userId: ownerId,
        name: doc.name || doc.teamName || 'Team',
        userName: managerName,
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
      };
    });

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