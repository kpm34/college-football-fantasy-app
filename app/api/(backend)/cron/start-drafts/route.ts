import { loadState, startDraft } from '@/lib/draft-v2/engine'
import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const fromVercelCron = Boolean(request.headers.get('x-vercel-cron'))

    console.log('[CRON] Start drafts cron triggered', {
      fromVercelCron,
      hasAuth: !!authHeader,
      time: new Date().toISOString(),
    })

    if (!fromVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('[CRON] Unauthorized access attempt')
      return new Response('Unauthorized', { status: 401 })
    }

    const now = Date.now()

    // Find drafts that are pre-draft and ready to start
    const draftsRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFTS, [
      Query.equal('draftStatus', 'pre-draft'),
      Query.lessThanEqual('startTime', new Date(now).toISOString()),
      Query.limit(100),
    ])

    const toStart = draftsRes.documents || []
    const results: any[] = []

    console.log(`[CRON] Found ${toStart.length} drafts to potentially start`)
    if (toStart.length > 0) {
      console.log(
        '[CRON] Drafts to start:',
        toStart.map((d: any) => ({
          leagueName: d.leagueName,
          startTime: d.startTime,
          status: d.draftStatus,
        }))
      )
    }

    for (const draft of toStart) {
      try {
        const leagueId = String(draft.leagueId || draft.league_id || '')
        if (!leagueId) {
          results.push({ draftId: draft.$id, ok: false, error: 'missing_league_id' })
          continue
        }

        // Ensure league is still scheduled
        try {
          const lg = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId)
          const phase = (lg as any).phase || (lg as any).draftStatus || 'scheduled'
          if (phase !== 'scheduled') {
            results.push({ draftId: draft.$id, ok: false, error: 'not_scheduled' })
            continue
          }
        } catch {
          results.push({ draftId: draft.$id, ok: false, error: 'league_not_found' })
          continue
        }

        // Skip if picks already exist
        const picks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [
          Query.equal('leagueId', leagueId),
          Query.limit(1),
        ])
        if (picks.total > 0) {
          results.push({ draftId: draft.$id, ok: false, error: 'picks_exist' })
          continue
        }

        // Ensure order exists
        let orderJson: any = {}
        try {
          orderJson = draft.orderJson ? JSON.parse(draft.orderJson) : {}
        } catch {}
        const draftOrder: string[] = Array.isArray(orderJson.draftOrder) ? orderJson.draftOrder : []
        if (!draftOrder || draftOrder.length === 0) {
          results.push({ draftId: draft.$id, ok: false, error: 'missing_order' })
          continue
        }

        // Idempotent start via engine
        try {
          const state = await startDraft(leagueId)
          // Mark drafts doc as drafting for convenience
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draft.$id, {
            draftStatus: 'drafting',
            currentRound: 1,
            currentPick: 1,
          })
          // Ensure draft_states is readable before returning (tiny wait/retry)
          let ok = false
          for (let i = 0; i < 5; i++) {
            const st = await loadState(leagueId)
            if (st && st.onClockTeamId) {
              ok = true
              break
            }
            await new Promise(r => setTimeout(r, 200))
          }
          if (!ok) throw new Error('state_missing_after_start')
        } catch (e: any) {
          results.push({ draftId: draft.$id, ok: false, error: e?.message || 'start_failed' })
          continue
        }

        results.push({
          draftId: draft.$id,
          leagueName: draft.leagueName,
          ok: true,
          message: 'Draft started',
        })

        console.log(`[CRON] Started draft for ${draft.leagueName}`)
      } catch (e: any) {
        results.push({
          draftId: draft.$id,
          leagueName: draft.leagueName,
          ok: false,
          error: e?.message,
        })
      }
    }

    return NextResponse.json({
      started: results.filter(r => r.ok).length,
      attempted: results.length,
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
