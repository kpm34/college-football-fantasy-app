import { NextRequest, NextResponse } from 'next/server';
import { serverRepositories } from '@domain/repositories';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export const runtime = 'nodejs';

// DEV-ONLY endpoint to create and join a league using server credentials
// Guarded by Authorization: Bearer <CRON_SECRET>
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const leagueName: string = body.leagueName || `Dev E2E ${new Date().toISOString().slice(11,19)}`;
    const maxTeams: number = Number(body.maxTeams || 12);
    const gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten' = body.gameMode || 'power4';
    const draftType: 'snake' | 'auction' = body.draftType || 'snake';
    const pickTimeSeconds: number = Number(body.pickTimeSeconds || 90);

    const commissionerAuthUserId: string = body.authUserId || process.env.TEST_AUTH_USER_ID || 'BOT-COMM';
    const additionalMembers: number = Math.max(0, Math.min(Number(body.additionalMembers || 0), maxTeams - 1));

    const { leagues } = serverRepositories;

    // Create league
    const league = await leagues.createLeague({
      leagueName,
      maxTeams,
      draftType,
      gameMode,
      isPublic: true,
      pickTimeSeconds,
      commissionerAuthUserId,
      season: new Date().getFullYear(),
    });

    // Auto-join commissioner
    const joinRes = await leagues.joinLeague(
      league.$id,
      commissionerAuthUserId,
      `${leagueName} Comm`
    );

    // Add additional members (fake users)
    const added: Array<{ userId: string; fantasyTeamId: string }> = [];
    for (let i = 0; i < additionalMembers; i++) {
      const fakeUserId = `BOT-${i + 1}-${Date.now()}`;
      const res = await leagues.joinLeague(league.$id, fakeUserId, `${leagueName} ${i + 2}`);
      added.push({ userId: fakeUserId, fantasyTeamId: res.fantasyTeamId });
    }

    // Create draft doc for the league
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        ID.unique(),
        {
          leagueId: league.$id,
          leagueName: leagueName,
          gameMode,
          maxTeams,
          draftStatus: 'pre-draft',
          type: draftType,
          currentRound: 0,
          currentPick: 0,
          maxRounds: 15,
          startTime: null,
          isMock: false,
          clockSeconds: pickTimeSeconds,
          orderJson: JSON.stringify({ draftOrder: [joinRes.fantasyTeamId], draftType, totalTeams: maxTeams, pickTimeSeconds })
        } as any
      );
    } catch {}

    return NextResponse.json({ ok: true, league, join: joinRes, added });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}


