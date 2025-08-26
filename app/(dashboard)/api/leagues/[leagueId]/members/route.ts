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

    // Fetch all rosters/teams in this league (support both league_id and leagueId)
    let rosters = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [
        Query.equal('leagueId', leagueId),
        Query.limit(100)
      ]
    );
    if (!rosters || rosters.documents.length === 0) {
      try {
        rosters = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ROSTERS,
          [
            Query.equal('leagueId', leagueId),
            Query.limit(100)
          ]
        );
      } catch {}
    }

    // Fetch memberships to leverage per-league member display names
    let memberships: any = { documents: [] };
    try {
      memberships = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUE_MEMBERSHIPS,
        [
          Query.equal('leagueId', leagueId),
          // Status is canonicalized to uppercase 'ACTIVE'
          Query.equal('status', 'ACTIVE'),
          Query.limit(200)
        ]
      );
      if (!memberships || memberships.documents.length === 0) {
        memberships = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LEAGUE_MEMBERSHIPS,
          [
            Query.equal('leagueId', leagueId),
            Query.equal('status', 'ACTIVE'),
            Query.limit(200)
          ]
        );
      }
    } catch {}

    // Resolve owner display names using Appwrite Users service
    const uniqueUserIds = Array.from(
      new Set(
        (rosters.documents || [])
          .map((d: any) => d.ownerAuthUserId || d.teammanager_id || d.authUserId || d.ownerClientId || d.clientId || d.owner || d.userId)
          .filter(Boolean)
      )
    );
    const idToName = new Map<string, string>();
    const membershipName = new Map<string, string>();

    // Build membership display name map (auth_user_id -> display_name)
    try {
      for (const m of memberships.documents || []) {
        // Prefer authUserId, but retain clientId fallback if present
        const key = (m as any).authUserId || (m as any).clientId;
        if (key && m?.displayName) membershipName.set(String(key), String(m.displayName));
      }
    } catch {}
    // Resolve names via clients collection (auth_user_id -> display_name) with fallbacks
    try {
      if (uniqueUserIds.length > 0) {
        const clientsRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.CLIENTS,
          [Query.equal('authUserId', uniqueUserIds as string[]), Query.limit(200)]
        );
        for (const c of clientsRes.documents || []) {
          if (c?.authUserId) {
            idToName.set(String(c.authUserId), String(c.displayName || c.email || 'Unknown'));
          }
        }

        // Fallback: some legacy rosters may store clients document IDs in owner_client_id
        const unresolved = uniqueUserIds.filter(uid => !idToName.has(String(uid)));
        if (unresolved.length > 0) {
          const clientsById = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CLIENTS,
            [Query.equal('$id', unresolved as string[]), Query.limit(200)]
          );
          for (const c of clientsById.documents || []) {
            idToName.set(String((c as any).$id), String((c as any).displayName || (c as any).email || 'Unknown'));
          }
        }
      }
    } catch {}

    // Map to consistent format with resolved manager name
    const teams = rosters.documents.map((doc: any) => {
      const ownerId = doc.ownerAuthUserId || doc.teammanager_id || doc.authUserId || doc.ownerClientId || doc.clientId || doc.owner || '';
      const managerName =
        membershipName.get(ownerId) ||
        idToName.get(ownerId) ||
        doc.displayName ||
        doc.userName ||
        'Unknown';
      return {
        $id: doc.$id,
        leagueId: doc.leagueId,
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