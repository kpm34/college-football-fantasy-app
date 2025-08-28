import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '@domain/repositories';

export const runtime = 'nodejs';

// DEV-ONLY endpoint to join a league as a synthetic user
// Guarded by Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const leagueId: string = body.leagueId;
    const authUserId: string = body.authUserId || `BOT-${Date.now()}`;
    const teamName: string = body.teamName || `Dev Team ${authUserId.slice(-4)}`;

    if (!leagueId) return NextResponse.json({ error: 'leagueId required' }, { status: 400 });

    const { leagues } = serverRepositories;
    const joinRes = await leagues.joinLeague(leagueId, authUserId, teamName);
    return NextResponse.json({ ok: true, join: joinRes });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}


