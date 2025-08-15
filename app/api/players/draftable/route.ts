import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

const FANTASY_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];
const POWER4 = ['SEC', 'Big Ten', 'Big 12', 'ACC'];

async function getDraftablePlayers(week: number) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYERS,
      [
        Query.equal('draftable', true),
        Query.equal('position', FANTASY_POSITIONS as any),
        Query.limit(1000),
        Query.orderDesc('rating')
      ]
    );

    return {
      players: response.documents,
      total: response.total,
      week
    };
  } catch (error) {
    console.error('Error fetching players from Appwrite:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get('week') || '1');
    const position = searchParams.get('position') || undefined;
    const team = searchParams.get('team') || undefined;
    const conference = searchParams.get('conference') || undefined;
    
    // Try to get real data from Appwrite first
    try {
      const data = await getDraftablePlayers(week);
      let players = data.players.filter((p: any) => p.draftable !== false);
      // Enforce fantasy positions
      players = players.filter((p: any) => FANTASY_POSITIONS.includes(p.position?.abbreviation || p.position));
      // Default to Power 4
      players = players.filter((p: any) => POWER4.includes((p.conference || '').toString()));
      if (position && position !== 'ALL') players = players.filter((p: any) => (p.position?.abbreviation || p.position) === position);
      if (team) players = players.filter((p: any) => (p.team || p.school || '').toLowerCase().includes(team.toLowerCase()));
      if (conference && conference !== 'ALL') players = players.filter((p: any) => (p.conference || '').toLowerCase() === conference.toLowerCase());

      return NextResponse.json({ players, total: players.length, week });
    } catch (error) {
      console.error('Error fetching from Appwrite:', error);
      return NextResponse.json({ players: [], total: 0, week });
    }
    
  } catch (error) {
    console.error('Error fetching draftable players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draftable players' },
      { status: 500 }
    );
  }
} 