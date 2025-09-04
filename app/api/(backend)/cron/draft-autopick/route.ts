import { maybeAutopick } from '@/lib/draft-v2/engine'
import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const fromVercelCron = Boolean(request.headers.get('x-vercel-cron'))
    if (!fromVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    const nowIso = new Date().toISOString()

    // Find active (drafting) drafts with expired deadlines
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_STATES, [
      Query.equal('draftStatus', 'drafting'),
      Query.lessThanEqual('deadlineAt', nowIso),
      Query.limit(100),
    ])

    const due = res.documents || []
    let successes = 0
    const results: any[] = []

    for (const st of due as any[]) {
      try {
        const leagueId = String(st.draftId || st.$id || '')
        if (!leagueId) {
          results.push({ id: null, ok: false, error: 'missing leagueId' })
          continue
        }
        await maybeAutopick(leagueId)
        successes += 1
        results.push({ id: leagueId, ok: true })
      } catch (e: any) {
        results.push({ id: (st as any)?.draftId, ok: false, error: e?.message })
      }
    }

    return NextResponse.json({ autopicked: successes, attempted: due.length, results })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
