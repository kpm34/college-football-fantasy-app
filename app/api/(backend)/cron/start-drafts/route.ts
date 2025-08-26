import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const fromVercelCron = Boolean(request.headers.get('x-vercel-cron'));
    
    console.log('[CRON] Start drafts cron triggered', {
      fromVercelCron,
      hasAuth: !!authHeader,
      time: new Date().toISOString()
    });
    
    if (!fromVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('[CRON] Unauthorized access attempt');
      return new Response('Unauthorized', { status: 401 });
    }

    const now = Date.now();

    // Find drafts that are scheduled and ready to start
    const draftsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFTS,
      [
        Query.equal('status', 'scheduled'),
        Query.lessThanEqual('startTime', new Date(now).toISOString()),
        Query.limit(100),
      ]
    );

    const toStart = draftsRes.documents || [];
    const results: any[] = [];
    
    console.log(`[CRON] Found ${toStart.length} drafts to potentially start`);
    if (toStart.length > 0) {
      console.log('[CRON] Drafts to start:', toStart.map((d: any) => ({ 
        leagueName: d.leagueName,
        startTime: d.startTime,
        status: d.status 
      })));
    }

    for (const draft of toStart) {
      try {
        // Update the draft status to active
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFTS,
          draft.$id,
          {
            status: 'active',
            currentRound: 1,
            currentPick: 1
          }
        );
        
        // Update the associated league status to drafting
        const leagueId = draft.leagueId || draft.league_id;
        if (leagueId) {
          try {
            await databases.updateDocument(
              DATABASE_ID,
              COLLECTIONS.LEAGUES,
              leagueId,
              { status: 'drafting' }
            );
          } catch (leagueError: any) {
            console.error(`[CRON] Failed to update league ${leagueId}:`, leagueError.message);
          }
        }
        
        results.push({ 
          draftId: draft.$id, 
          leagueName: draft.leagueName,
          ok: true, 
          message: 'Draft started' 
        });
        
        console.log(`[CRON] Started draft for ${draft.leagueName}`);
        
      } catch (e: any) {
        results.push({ 
          draftId: draft.$id, 
          leagueName: draft.leagueName,
          ok: false, 
          error: e?.message 
        });
      }
    }

    return NextResponse.json({ started: results.filter(r => r.ok).length, attempted: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
}


