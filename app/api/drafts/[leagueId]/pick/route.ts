import { applyPick, validatePick } from '@/lib/draft-v2/engine'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params
    const idemKey =
      request.headers.get('Idempotency-Key') || request.headers.get('idempotency-key') || ''
    if (!idemKey) {
      return NextResponse.json({ error: 'missing_idempotency_key' }, { status: 400 })
    }

    const body = await request.json()
    if (!body || typeof body.teamId !== 'string' || typeof body.playerId !== 'string') {
      return NextResponse.json({ error: 'invalid_payload' }, { status: 400 })
    }
    const { teamId, playerId } = body as { teamId: string; playerId: string }

    await validatePick({ leagueId, teamId, playerId, idemKey })
    await applyPick({ leagueId, teamId, playerId, idemKey })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    const msg: string = String(error?.message || '')
    const map: Record<string, number> = {
      not_on_clock: 409,
      player_already_drafted: 409,
      window_expired: 409,
      unknown_league_or_state: 404,
      missing_idempotency_key: 400,
    }
    const status = map[msg as keyof typeof map] || 500
    return NextResponse.json({ error: msg || 'unknown_error' }, { status })
  }
}
