import { NextRequest, NextResponse } from 'next/server'
import { maybeAutopick } from '@/lib/draft-v2/engine'

export async function POST(_req: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params
    await maybeAutopick(leagueId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
