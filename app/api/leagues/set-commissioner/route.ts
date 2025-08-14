import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { leagueId, userId, email, name } = await request.json();
    if (!leagueId || (!userId && !email && !name)) {
      return NextResponse.json({ error: 'leagueId and at least one of userId/email/name are required' }, { status: 400 });
    }

    const league = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId
    );

    const updates: Record<string, any> = {};
    if (userId) updates.commissionerId = userId;
    if (email) updates.commissionerEmail = email;
    if (name) updates.commissioner = name;

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LEAGUES,
      leagueId,
      updates
    );

    return NextResponse.json({ success: true, leagueId, updates });
  } catch (error) {
    console.error('set-commissioner error:', error);
    return NextResponse.json({ error: 'failed to set commissioner' }, { status: 500 });
  }
}


