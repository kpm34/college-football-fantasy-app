import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query, ID } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is from cron or has proper auth
    const authHeader = request.headers.get('authorization');
    const fromVercelCron = Boolean(request.headers.get('x-vercel-cron'));
    if (!fromVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const now = Date.now();
    const oneHourFromNow = now + 60 * 60 * 1000; // 1 hour in milliseconds

    // Find leagues with drafts starting within the next hour that don't have draft orders set
    const leaguesRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      [
        Query.lessThanEqual('draftDate', new Date(oneHourFromNow).toISOString()),
        Query.greaterThan('draftDate', new Date(now).toISOString()),
        Query.limit(100),
      ]
    );

    const results: any[] = [];
    
    for (const league of leaguesRes.documents) {
      try {
        // Check if league already has a draft order
        const existingOrder = (league as any).draftOrder;
        if (existingOrder && Array.isArray(existingOrder) && existingOrder.length > 0) {
          results.push({ 
            leagueId: league.$id, 
            status: 'skipped', 
            reason: 'already has draft order' 
          });
          continue;
        }

        // Get league members
        const membersRes = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.LEAGUE_MEMBERSHIPS || 'league_memberships',
          [
            Query.equal('leagueId', league.$id),
            Query.equal('status', 'active'),
            Query.limit(100),
          ]
        );

        if (membersRes.documents.length === 0) {
          results.push({ 
            leagueId: league.$id, 
            status: 'skipped', 
            reason: 'no active members' 
          });
          continue;
        }

        // Create random order from member IDs
        const memberIds = membersRes.documents.map((m: any) => m.clientId || m.userId);
        const randomOrder = shuffleArray(memberIds);

        // Update league with random draft order
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.LEAGUES,
          league.$id,
          {
            draftOrder: randomOrder,
            orderMode: 'random',
          }
        );

        // Also update the draft document if it exists
        try {
          const draftsRes = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DRAFTS,
            [Query.equal('leagueId', league.$id), Query.limit(1)]
          );

          if (draftsRes.documents.length > 0) {
            const draftDoc = draftsRes.documents[0];
            
            // Parse existing orderJson
            let orderJson: any = {};
            try {
              orderJson = draftDoc.orderJson ? JSON.parse(draftDoc.orderJson) : {};
            } catch {}
            
            // Update with random order
            orderJson.draftOrder = randomOrder;
            
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.DRAFTS,
              draftDoc.$id,
              {
                orderJson: JSON.stringify(orderJson),
              }
            );
          }
        } catch (draftError) {
          console.error(`Failed to update draft document for league ${league.$id}:`, draftError);
        }

        results.push({ 
          leagueId: league.$id, 
          status: 'success', 
          membersCount: randomOrder.length,
          draftTime: (league as any).draftDate,
        });

        console.log(`Assigned random draft order to league ${league.$id} with ${randomOrder.length} members`);
      } catch (error: any) {
        results.push({ 
          leagueId: league.$id, 
          status: 'error', 
          error: error?.message 
        });
        console.error(`Failed to assign draft order for league ${league.$id}:`, error);
      }
    }

    return NextResponse.json({ 
      processed: leaguesRes.documents.length,
      assigned: results.filter(r => r.status === 'success').length,
      results 
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}
