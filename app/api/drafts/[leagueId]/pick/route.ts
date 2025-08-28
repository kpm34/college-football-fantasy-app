import { NextRequest, NextResponse } from 'next/server'
import { validatePick, applyPick } from '@/lib/draft-v2/engine'

export async function POST(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params
    const idemKey = request.headers.get('Idempotency-Key') || ''
    const body = await request.json()
    const { teamId, playerId } = body as { teamId: string; playerId: string }

    await validatePick({ leagueId, teamId, playerId, idemKey })
    const updated = await applyPick({ leagueId, teamId, playerId, idemKey })
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('pick route error', error)
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
