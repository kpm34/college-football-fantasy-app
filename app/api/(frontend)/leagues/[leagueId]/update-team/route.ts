import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@/lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ leagueId: string }> }) {
  const { leagueId } = await params;
  try {
    // Get user from session
    const sessionCookie = request.cookies.get('appwrite-session')?.value
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`
    const userRes = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Response-Format': '1.4.0',
        Cookie: cookieHeader,
      },
    })

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await userRes.json()

    const body = await request.json()
    const { fantasyTeamId, updates } = body

    if (!fantasyTeamId || !updates) {
      return NextResponse.json({ error: 'Team ID and updates are required' }, { status: 400 })
    }

    // Load the target roster first; if not found, fallback to TEAMS collection
    let collectionToUpdate = COLLECTIONS.ROSTER_SLOTS
    let teamDoc: any = null
    try {
      teamDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.ROSTER_SLOTS, fantasyTeamId)
    } catch (_err) {
      try {
        teamDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.SCHOOLS, fantasyTeamId)
        collectionToUpdate = 'schools' as typeof COLLECTIONS.ROSTER_SLOTS
      } catch (_err2) {
        return NextResponse.json({ error: 'Team not found' }, { status: 404 })
      }
    }

    // Verify the team belongs to the league in the URL
    if ((teamDoc as any).leagueId !== resolvedParams.leagueId) {
      return NextResponse.json({ error: 'Team does not belong to this league' }, { status: 400 })
    }

    // Fetch league to determine commissioner privileges
    const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, resolvedParams.leagueId)

    const isOwner = (teamDoc as any).clientId === user.$id || (teamDoc as any).ownerId === user.$id
    const isCommissioner = Boolean(
      (league as any)?.commissioner && (league as any).commissioner === user.$id
    )

    if (!isOwner && !isCommissioner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update the team document in the correct collection
    const result = await databases.updateDocument(
      DATABASE_ID,
      collectionToUpdate,
      fantasyTeamId,
      updates
    )

    return NextResponse.json({ success: true, team: result })
  } catch (error: any) {
    console.error('Update team error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update team' },
      { status: error.code === 401 ? 401 : 500 }
    )
  }
}
