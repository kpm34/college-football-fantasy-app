import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@/lib/appwrite-server'
import { loadState, startDraft } from '@/lib/draft-v2/engine'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params
    const state = await startDraft(leagueId)
    // Ensure state document is readable before returning
    let snap = null
    for (let i = 0; i < 10; i++) {
      const s = await loadState(leagueId)
      if (s) {
        snap = s
        break
      }
      await new Promise(r => setTimeout(r, 200))
    }
    if (!snap) {
      // As a last-resort, upsert the state document using the computed state
      try {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId, {
          draftId: String(leagueId),
          onClockTeamId: state.onClockTeamId,
          deadlineAt: state.deadlineAt,
          round: state.round,
          pickIndex: state.pickIndex,
          draftStatus: 'drafting',
        } as any)
        const s2 = await loadState(leagueId)
        if (s2) snap = s2
      } catch (e: any) {
        // ignore if already exists
      }
    }
    return NextResponse.json({ data: snap || state })
  } catch (error) {
    console.error('startDraft error', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
