import { COLLECTIONS, DATABASE_ID, serverDatabases as databases } from '@/lib/appwrite-server'
import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function deleteByQuery(collectionId: string, queries: string[]) {
  try {
    let cursor: string | null = null
    // Iterate up to a safe number of pages
    for (let page = 0; page < 20; page++) {
      const pageQueries = [...queries, Query.limit(100)]
      if (cursor) pageQueries.push(Query.cursorAfter(cursor))
      const res = await databases.listDocuments(DATABASE_ID, collectionId, pageQueries)
      if (!res.documents || res.documents.length === 0) break
      for (const doc of res.documents as any[]) {
        try {
          await databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
        } catch {}
        cursor = doc.$id
      }
      if (res.documents.length < 100) break
    }
  } catch {}
}

export async function DELETE(_req: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    // Protected debug endpoint
    const auth = _req.headers.get('authorization') || ''
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const leagueId = params.leagueId
    if (!leagueId) return NextResponse.json({ error: 'leagueId required' }, { status: 400 })

    // Delete related docs first
    await Promise.all([
      // Draft picks for this league
      deleteByQuery(COLLECTIONS.DRAFT_PICKS, [Query.equal('leagueId', leagueId)]),
      // League memberships
      deleteByQuery(COLLECTIONS.LEAGUE_MEMBERSHIPS, [Query.equal('leagueId', leagueId)]),
      // Fantasy teams
      deleteByQuery(COLLECTIONS.FANTASY_TEAMS, [Query.equal('leagueId', leagueId)]),
    ])

    // Delete draft state (doc id == leagueId or draftId == leagueId)
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId)
    } catch {}
    await deleteByQuery(COLLECTIONS.DRAFT_STATES, [Query.equal('draftId', leagueId)])

    // Delete draft document(s)
    await deleteByQuery(COLLECTIONS.DRAFTS, [Query.equal('leagueId', leagueId)])

    // Finally delete the league itself
    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId)
    } catch {}

    return NextResponse.json({ ok: true, deletedLeagueId: leagueId })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 })
  }
}
