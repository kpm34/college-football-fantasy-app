import { NextRequest, NextResponse } from 'next/server'
import { loadState, pauseDraft } from '@/lib/draft-v2/engine'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ leagueId: string  }> }) {
  try {
    const { leagueId  } = await params
    const state = await pauseDraft(leagueId)
    return NextResponse.json({ data: state })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
