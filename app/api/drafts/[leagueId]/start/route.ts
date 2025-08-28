import { NextRequest, NextResponse } from 'next/server'
import { startDraft } from '@/lib/draft-v2/engine'

export async function POST(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params
    const state = await startDraft(leagueId)
    return NextResponse.json({ data: state })
  } catch (error) {
    console.error('startDraft error', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
