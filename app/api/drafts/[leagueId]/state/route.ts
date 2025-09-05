import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@/lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: { leagueId: string } }) {
  const { leagueId } = params
  try {
    const doc: any = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId)

    const payload = {
      draftId: String(doc?.draftId ?? leagueId),
      onClockTeamId: String(doc?.onClockTeamId ?? ''),
      deadlineAt: String(doc?.deadlineAt ?? ''),
      round: Number(doc?.round ?? 0),
      pickIndex: Number(doc?.pickIndex ?? 0),
      draftStatus:
        (doc?.draftStatus as 'scheduled' | 'drafting' | 'paused' | 'complete') ?? 'scheduled',
    }

    return new NextResponse(JSON.stringify({ data: payload }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: any) {
    if (error?.code === 404) {
      return new NextResponse(JSON.stringify({ error: 'state_not_found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      })
    }
    return new NextResponse(JSON.stringify({ error: error?.message || 'failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }
}
