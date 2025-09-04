import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@/lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { leagueId: string } }) {
  const { leagueId } = params
  try {
    // League
    const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId)

    // Teams
    const teamsRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, [
      Query.equal('leagueId', leagueId),
      Query.limit(200),
    ])

    // Picks (recent first, limited)
    const picksRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_PICKS, [
      Query.equal('leagueId', leagueId),
      Query.orderDesc('timestamp'),
      Query.limit(50),
    ])

    // State (by id or by draftId)
    let state: any | null = null
    try {
      state = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId)
    } catch {
      try {
        const list = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_STATES, [
          Query.equal('draftId', leagueId),
          Query.limit(1),
        ])
        state = list.documents?.[0] || null
      } catch {}
    }

    // Current user id (best-effort from Appwrite account using cookie)
    let me: string | null = null
    try {
      const cookie = request.headers.get('cookie') || ''
      if (cookie) {
        const res = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
          headers: {
            'X-Appwrite-Project':
              process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
            'X-Appwrite-Response-Format': '1.4.0',
            Cookie: cookie,
          },
        })
        if (res.ok) {
          const u = await res.json()
          me = u?.$id || null
        }
      }
    } catch {}

    // Enrich picks with player data
    const enrichedPicks = await Promise.all(
      (picksRes.documents || []).map(async (p: any) => {
        let player: any = null
        try {
          player = await databases.getDocument(DATABASE_ID, COLLECTIONS.PLAYERS, String(p.playerId))
        } catch {}
        return {
          id: p.$id,
          playerId: p.playerId,
          playerName: player?.name || p.playerName || 'Player',
          team: player?.team || player?.school || 'Unknown',
          position: player?.position || 'UNK',
          draftedBy: p.teamId,
          overall: p.pick,
          round: p.round,
          timestamp: p.timestamp,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        league: {
          $id: league.$id,
          leagueName: (league as any).leagueName || (league as any).name,
          engineVersion: (league as any).engineVersion || 'v2',
          pickTimeSeconds: (league as any).pickTimeSeconds || (league as any).clockSeconds || 60,
          draftType: (league as any).draftType || (league as any).type || 'snake',
          phase: (league as any).phase || (league as any).draftStatus || 'scheduled',
          selectedConference: (league as any).selectedConference,
          draftDate: (league as any).draftDate || (league as any).startTime,
        },
        teams:
          teamsRes.documents?.map((t: any) => ({
            $id: t.$id,
            teamName: t.teamName,
            ownerAuthUserId: t.ownerAuthUserId,
          })) || [],
        picks: {
          items: enrichedPicks,
          total: picksRes.total || 0,
        },
        state: state
          ? {
              onClockTeamId: (state as any).onClockTeamId || null,
              round: Number((state as any).round || 0),
              pickIndex: Number((state as any).pickIndex || 0),
              deadlineAt: (state as any).deadlineAt || null,
              status: (state as any).draftStatus || 'pre-draft',
            }
          : null,
        me,
        nowIso: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load draft data' },
      { status: 500 }
    )
  }
}
