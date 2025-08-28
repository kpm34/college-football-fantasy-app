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

// DELETE remove a member (commissioner only): cascade delete memberships, fantasy teams, roster slots, lineups; update league currentTeams and draft order
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await context.params;
    const { searchParams } = new URL(request.url);
    const targetAuthUserId = searchParams.get('authUserId');
    if (!leagueId || !targetAuthUserId) {
      return NextResponse.json({ error: 'leagueId and authUserId are required' }, { status: 400 });
    }

    // Auth check via session cookie
    let sessionCookie = request.cookies.get('appwrite-session')?.value as string | undefined;
    if (!sessionCookie) sessionCookie = request.cookies.get('a_session_college-football-fantasy-app')?.value as string | undefined;
    if (!sessionCookie) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        'Cookie': cookieHeader,
      },
    });
    if (!userRes.ok) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const me = await userRes.json();

    // Verify commissioner
    const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId);
    const commissionerId = (league as any).commissionerAuthUserId;
    if (!commissionerId || commissionerId !== me.$id) {
      return NextResponse.json({ error: 'Only the commissioner can remove members' }, { status: 403 });
    }

    // Remove league_membership
    const memberships = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUE_MEMBERSHIPS,
      [Query.equal('leagueId', leagueId), Query.equal('authUserId', targetAuthUserId), Query.limit(10)]
    );
    for (const m of memberships.documents || []) {
      try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUE_MEMBERSHIPS, m.$id); } catch {}
    }

    // Remove fantasy team(s)
    const teams = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FANTASY_TEAMS,
      [Query.equal('leagueId', leagueId), Query.equal('ownerAuthUserId', targetAuthUserId), Query.limit(10)]
    );
    for (const t of teams.documents || []) {
      // Remove roster slots for team
      try {
        const slots = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.ROSTER_SLOTS,
          [Query.equal('fantasyTeamId', t.$id), Query.limit(200)]
        );
        for (const s of slots.documents || []) {
          try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ROSTER_SLOTS, s.$id); } catch {}
        }
      } catch {}
      // Remove lineups for team
      try {
        const lineups = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LINEUPS,
          [Query.equal('fantasyTeamId', t.$id), Query.limit(200)]
        );
        for (const l of lineups.documents || []) {
          try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LINEUPS, l.$id); } catch {}
        }
      } catch {}
      // Delete the fantasy team
      try { await databases.deleteDocument(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, t.$id); } catch {}
    }

    // Update league counts and leagueStatus
    const newCount = Math.max(0, (league as any).currentTeams ? (league as any).currentTeams - 1 : 0);
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      { currentTeams: newCount, leagueStatus: newCount >= (league as any).maxTeams ? 'closed' : 'open' } as any
    );

    // Update draft.orderJson: remove this authUserId if present
    try {
      const drafts = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFTS, [Query.equal('leagueId', leagueId), Query.limit(1)]);
      if (drafts.documents.length > 0) {
        const draft = drafts.documents[0];
        let orderJson: any = {};
        try { orderJson = draft.orderJson ? JSON.parse(draft.orderJson) : {}; } catch {}
        if (Array.isArray(orderJson.draftOrder)) {
          orderJson.draftOrder = orderJson.draftOrder.filter((id: any) => String(id) !== String(targetAuthUserId));
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draft.$id, { orderJson: JSON.stringify(orderJson) } as any);
        }
      }
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: error.message || 'Failed to remove member' }, { status: 500 });
  }
}