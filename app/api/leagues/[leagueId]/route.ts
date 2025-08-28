import { NextRequest, NextResponse } from 'next/server'
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'

export async function GET(_req: NextRequest, { params }: { params: { leagueId: string } }) {
  try {
    const { leagueId } = params
    const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId)
    return NextResponse.json({ data: league })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 })
  }
}
