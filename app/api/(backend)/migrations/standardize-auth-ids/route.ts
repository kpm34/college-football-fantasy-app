import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases, serverUsers, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server'
import { Query } from 'node-appwrite'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const provided = request.headers.get('x-cron-secret') || new URL(request.url).searchParams.get('secret') || ''
    const expected = process.env.CRON_SECRET || ''
    if (!expected || provided !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: any = { fantasyTeamsUpdated: 0, membershipsUpdated: 0, missingUsers: 0 }

    // 1) fantasy_teams: ensure display_name from Auth users when owner_client_id is present
    const teams = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, [Query.limit(1000)])
    for (const t of teams.documents as any[]) {
      const ownerId: string | undefined = t.owner_client_id || t.client_id || t.owner
      if (!ownerId || String(ownerId).startsWith('BOT-')) continue
      try {
        const u: any = await serverUsers.get(ownerId)
        const display = u.name || u.email || 'Unknown User'
        if (t.display_name !== display) {
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.FANTASY_TEAMS, t.$id, { display_name: display })
          results.fantasyTeamsUpdated++
        }
      } catch {
        results.missingUsers++
      }
    }

    // 2) league_memberships: set client_id to auth_user_id when mismatched, and backfill display_name from Auth or clients
    try {
      const memberships = await databases.listDocuments(DATABASE_ID, 'league_memberships', [Query.limit(1000)])
      for (const m of memberships.documents as any[]) {
        const currentClientId: string | undefined = m.client_id
        let desiredId = currentClientId
        try {
          if (!currentClientId) continue
          let display = 'Unknown User'

          // If client_id is already an Auth user id, use it
          try {
            const u: any = await serverUsers.get(currentClientId)
            desiredId = u.$id
            display = u.name || u.email || display
          } catch {
            // Otherwise, try to resolve via clients collection (id -> auth_user_id)
            try {
              const clientDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.CLIENTS, currentClientId)
              if (clientDoc?.auth_user_id) {
                desiredId = clientDoc.auth_user_id
                display = clientDoc.display_name || display
              }
            } catch {}
          }

          const payload: any = {}
          if (desiredId && m.client_id !== desiredId) payload.client_id = desiredId
          if (display && m.display_name !== display) payload.display_name = display
          if (Object.keys(payload).length > 0) {
            await databases.updateDocument(DATABASE_ID, 'league_memberships', m.$id, payload)
            results.membershipsUpdated++
          }
        } catch {
          results.missingUsers++
        }
      }
    } catch {}

    return NextResponse.json({ ok: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Migration failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) { return POST(request) }


