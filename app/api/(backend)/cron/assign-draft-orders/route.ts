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

    // Find drafts starting within the next hour that don't have draft order set in orderJson
    const draftsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFTS,
      [
        Query.lessThanEqual('startTime', new Date(oneHourFromNow).toISOString()),
        Query.greaterThan('startTime', new Date(now).toISOString()),
        Query.limit(100),
      ]
    );

    const results: any[] = [];
    
    for (const draft of draftsRes.documents) {
      try {
        // Check existing order in draft.orderJson
        let orderJson: any = {};
        try { orderJson = draft.orderJson ? JSON.parse(draft.orderJson) : {}; } catch {}
        const existingOrder = orderJson.draftOrder;
        if (existingOrder && Array.isArray(existingOrder) && existingOrder.length > 0) {
          results.push({ 
            leagueId: draft.leagueId, 
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
            Query.equal('leagueId', draft.leagueId),
            Query.equal('status', 'ACTIVE'),
            Query.limit(100),
          ]
        );

        if (membersRes.documents.length === 0) {
          results.push({ 
            leagueId: draft.leagueId, 
            status: 'skipped', 
            reason: 'no active members' 
          });
          continue;
        }

        // Create random order from member IDs
        const memberIds = membersRes.documents.map((m: any) => m.authUserId || m.clientId || m.userId).filter(Boolean);
        const randomOrder = shuffleArray(memberIds);

        // Update the draft document with randomized order
        orderJson.draftOrder = randomOrder;
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          draft.$id,
          { orderJson: JSON.stringify(orderJson) }
        );

        results.push({ 
          leagueId: draft.leagueId, 
          status: 'success', 
          membersCount: randomOrder.length,
          draftTime: (draft as any).startTime,
        });

        console.log(`Assigned random draft order to league ${draft.leagueId} with ${randomOrder.length} members`);
      } catch (error: any) {
        results.push({ 
          leagueId: draft.leagueId, 
          status: 'error', 
          error: error?.message 
        });
        console.error(`Failed to assign draft order for league ${draft.leagueId}:`, error);
      }
    }

    return NextResponse.json({ 
      processed: draftsRes.documents.length,
      assigned: results.filter(r => r.status === 'success').length,
      results 
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}
