import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

type MigrateBody = {
  leagueId?: string;
  leagueName?: string;
};

export async function POST(request: NextRequest) {
  try {
    const { leagueId: bodyLeagueId, leagueName } = (await request.json()) as MigrateBody;

    // 1) Resolve leagueId
    let leagueId = bodyLeagueId || '';
    let resolvedLeagueName = leagueName || '';

    if (!leagueId) {
      if (!leagueName) {
        return NextResponse.json({ error: 'leagueId or leagueName is required' }, { status: 400 });
      }
      // Try exact match first
      let leagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, [
        Query.equal('name', leagueName),
        Query.limit(1),
      ]);
      if (leagues.total === 0) {
        // Fallback to search
        leagues = await databases.listDocuments(DATABASE_ID, COLLECTIONS.LEAGUES, [
          Query.search('name', leagueName),
          Query.limit(1),
        ]);
      }
      if (leagues.total === 0) {
        return NextResponse.json({ error: `League not found for name: ${leagueName}` }, { status: 404 });
      }
      const leagueDoc: any = leagues.documents[0];
      leagueId = leagueDoc.$id;
      resolvedLeagueName = leagueDoc.name || leagueName;
    }

    // 2) Load existing TEAMS for league
    const teamsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TEAMS,
      [Query.equal('leagueId', leagueId), Query.limit(1000)]
    );
    const existingUserIds = new Set<string>(
      (teamsRes.documents as any[]).map((d) => d.userId || d.owner).filter(Boolean)
    );

    // 3) Load legacy ROSTERS for league
    const rostersRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ROSTERS,
      [Query.equal('leagueId', leagueId), Query.limit(1000)]
    );

    let migratedCount = 0;
    let updatedUsers = 0;

    for (const roster of rostersRes.documents as any[]) {
      const userId: string | undefined = roster.userId || roster.owner;
      if (!userId) continue;

      // Create team if missing for user
      if (!existingUserIds.has(userId)) {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.TEAMS, ID.unique(), {
          leagueId,
          userId,
          name: roster.teamName || roster.name || 'Team',
          userName: roster.userName,
          email: roster.email,
          wins: roster.wins ?? 0,
          losses: roster.losses ?? 0,
          ties: roster.ties ?? 0,
          points: roster.points ?? roster.pointsFor ?? 0,
          pointsFor: roster.pointsFor ?? roster.points ?? 0,
          pointsAgainst: roster.pointsAgainst ?? 0,
          players: roster.players,
          createdAt: roster.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        migratedCount++;
        existingUserIds.add(userId);
      }

      // Ensure USERS doc links this league
      try {
        // Prefer lookup by userId, then email
        let users = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.USERS,
          [Query.equal('userId', userId), Query.limit(1)]
        );
        if (users.total === 0 && roster.email) {
          users = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.USERS,
            [Query.equal('email', roster.email), Query.limit(1)]
          );
        }
        if (users.total > 0) {
          const userDoc: any = users.documents[0];
          const leagues: string[] = Array.isArray(userDoc.leagues) ? [...userDoc.leagues] : [];
          const leagueNames: string[] = Array.isArray(userDoc.leagueNames) ? [...userDoc.leagueNames] : [];
          let changed = false;
          if (!leagues.includes(leagueId)) {
            leagues.push(leagueId);
            changed = true;
          }
          if (resolvedLeagueName && !leagueNames.includes(resolvedLeagueName)) {
            leagueNames.push(resolvedLeagueName);
            changed = true;
          }
          if (changed) {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.USERS,
              userDoc.$id,
              { leagues, leagueNames }
            );
            updatedUsers++;
          }
        }
      } catch (_) {
        // best-effort; ignore user linking errors
      }
    }

    return NextResponse.json({ success: true, leagueId, migratedCount, updatedUsers });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}


