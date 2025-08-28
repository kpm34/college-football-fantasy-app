import { Query, ID } from 'node-appwrite';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

async function main() {
  console.log('🔧 Backfilling commissioner memberships...');

  const leagues = await databases.listDocuments(
    DATABASE_ID,
    COLLECTIONS.LEAGUES,
    [Query.limit(1000)]
  );

  let updated = 0;
  let created = 0;

  for (const league of leagues.documents as any[]) {
    const commissionerAuthUserId: string | undefined = (league as any).commissionerAuthUserId || (league as any).commissioner;
    if (!commissionerAuthUserId) continue;

    const leagueId = String(league.$id);
    const leagueName = String((league as any).leagueName || (league as any).name || '');

    // Ensure a membership exists for the commissioner
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUE_MEMBERSHIPS,
      [
        Query.equal('leagueId', leagueId),
        Query.equal('authUserId', commissionerAuthUserId),
        Query.limit(1)
      ]
    );

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      const needsRole = (doc as any).role !== 'COMMISSIONER';
      const needsStatus = (doc as any).status !== 'ACTIVE';
      const needsName = !(doc as any).leagueName && !!leagueName;
      if (needsRole || needsStatus || needsName) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUE_MEMBERSHIPS,
          doc.$id,
          {
            role: 'COMMISSIONER',
            status: 'ACTIVE',
            leagueName: leagueName || (doc as any).leagueName,
          } as any
        );
        updated++;
        console.log(`✔ Updated membership for league ${leagueId} → ${commissionerAuthUserId}`);
      }
      continue;
    }

    // Fetch displayName from clients if available
    let displayName = '';
    try {
      const clients = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CLIENTS,
        [Query.equal('authUserId', commissionerAuthUserId), Query.limit(1)]
      );
      displayName = (clients.documents[0] as any)?.displayName || '';
    } catch {}

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUE_MEMBERSHIPS,
      ID.unique(),
      {
        leagueId,
        leagueName,
        authUserId: commissionerAuthUserId,
        role: 'COMMISSIONER',
        status: 'ACTIVE',
        displayName,
        joinedAt: new Date().toISOString(),
      } as any
    );
    created++;
    console.log(`➕ Created membership for league ${leagueId} → ${commissionerAuthUserId}`);
  }

  console.log(`Done. Updated: ${updated}, Created: ${created}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


