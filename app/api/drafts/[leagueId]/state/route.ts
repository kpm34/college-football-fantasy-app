import { NextRequest, NextResponse } from 'next/server'
import { loadState } from '@/lib/draft-v2/engine'

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params
    const state = await loadState(leagueId)
    return NextResponse.json({ data: state })
  } catch (error) {
    console.error('state route error', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
