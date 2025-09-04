import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'
import { Permission, Query, Role } from 'node-appwrite'

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

    // Helper to shuffle arrays (Fisher–Yates)
    function shuffle<T>(arr: T[]): T[] {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    for (const draft of toStart) {
      try {
        // Compute on-the-clock and deadline from orderJson + clockSeconds
        let orderJson: any = {}
        try {
          orderJson = draft.orderJson ? JSON.parse(draft.orderJson) : {}
        } catch {}
        let draftOrder: string[] = Array.isArray(orderJson.draftOrder) ? orderJson.draftOrder : []

        // Fallback: if no order exists, derive from fantasy_teams in this league
        if (!draftOrder || draftOrder.length === 0) {
          try {
            const teams = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, [
              Query.equal('leagueId', draft.leagueId),
              Query.limit(200),
            ])
            const teamIds = (teams.documents || []).map((t: any) => String(t.$id))
            if (teamIds.length > 0) {
              draftOrder = shuffle(teamIds)
              orderJson.draftOrder = draftOrder
              await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draft.$id, {
                orderJson: JSON.stringify(orderJson),
              })
              console.log('[CRON] Generated fallback draft order for league', draft.leagueId)
            }
          } catch (e) {
            console.warn('[CRON] Failed to generate fallback draft order', e)
          }
        }

        const onClockTeamId: string | null = draftOrder.length > 0 ? String(draftOrder[0]) : null
        const clockSeconds = Number((draft as any).clockSeconds || orderJson.pickTimeSeconds || 90)
        const deadlineAt = new Date(Date.now() + clockSeconds * 1000).toISOString()

        // Update the draft status to drafting
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draft.$id, {
          draftStatus: 'drafting',
          currentRound: 1,
          currentPick: 1,
        })

        // Create or update a draft_state snapshot for this draft/league
        const leagueId = draft.leagueId || draft.league_id
        if (leagueId && onClockTeamId) {
          try {
            await databases.createDocument(
              DATABASE_ID,
              COLLECTIONS.DRAFT_STATES,
              String(leagueId),
              {
                _id: String(leagueId),
                draftId: String(leagueId),
                onClockTeamId,
                deadlineAt,
                round: 1,
                pickIndex: 1,
                draftStatus: 'drafting',
              },
              [
                // Allow authenticated clients to read the state; writes remain server-only
                Permission.read(Role.users()),
              ]
            )
          } catch (e: any) {
            try {
              const existing = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.DRAFT_STATES,
                [Query.equal('draftId', String(leagueId)), Query.limit(1)]
              )
              if (existing.documents.length > 0) {
                await databases.updateDocument(
                  DATABASE_ID,
                  COLLECTIONS.DRAFT_STATES,
                  existing.documents[0].$id,
                  { onClockTeamId, deadlineAt, round: 1, pickIndex: 1, draftStatus: 'drafting' },
                  [Permission.read(Role.users())]
                )
              }
            } catch {}
          }
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
