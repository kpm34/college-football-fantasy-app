import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID } from 'node-appwrite';

const CFBD_API_KEY = process.env.CFBD_API_KEY || '';
const CFBD_BASE_URL = 'https://api.collegefootballdata.com';

interface CFBDPlayer {
  id: number;
  first_name: string;
  last_name: string;
  team: string;
  position: string;
  jersey?: number;
  height?: number;
  weight?: number;
  year?: number;
  season: number;
}

interface CFBDTeam {
  id: number;
  school: string;
  mascot?: string;
  abbreviation: string;
  conference: string;
  division: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || '2025';
    const team = searchParams.get('team');
    const conference = searchParams.get('conference');

    console.log(`🔍 Fetching CFBD players for season ${season}...`);

    // Build CFBD API URL
    let cfbdUrl = `${CFBD_BASE_URL}/players?season=${season}`;
    if (team) cfbdUrl += `&team=${team}`;
    if (conference) cfbdUrl += `&conference=${conference}`;

    const response = await fetch(cfbdUrl, {
      headers: {
        'Authorization': `Bearer ${CFBD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CFBD API error: ${response.status} ${response.statusText}`);
    }

    const cfbdPlayers: CFBDPlayer[] = await response.json();
    console.log(`✅ Fetched ${cfbdPlayers.length} players from CFBD`);

    // Filter for fantasy-relevant positions
    const fantasyPositions = ['QB', 'RB', 'WR', 'TE', 'K'];
    const fantasyPlayers = cfbdPlayers.filter(player => 
      fantasyPositions.includes(player.position)
    );

    console.log(`🎯 Found ${fantasyPlayers.length} fantasy-relevant players`);

    // Transform and upsert players
    let createdCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const cfbdPlayer of fantasyPlayers) {
      try {
        // Check if player already exists
        const existingPlayers = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.players,
          [
            // Query by CFBD ID if we have it, otherwise by name + team
            (await import('appwrite')).Query.equal('cfbd_id', cfbdPlayer.id.toString())
          ]
        );

        const playerData = {
          cfbd_id: cfbdPlayer.id.toString(),
          first_name: cfbdPlayer.first_name,
          last_name: cfbdPlayer.last_name,
          name: `${cfbdPlayer.first_name} ${cfbdPlayer.last_name}`,
          position: cfbdPlayer.position,
          team: cfbdPlayer.team,
          conference: '', // Will be filled from team data
          jersey: cfbdPlayer.jersey?.toString() || '',
          height: cfbdPlayer.height ? `${Math.floor(cfbdPlayer.height / 12)}-${cfbdPlayer.height % 12}` : '6-0',
          weight: cfbdPlayer.weight?.toString() || '200',
          year: cfbdPlayer.year ? getYearString(cfbdPlayer.year) : 'FR',
          season: cfbdPlayer.season,
          draftable: cfbdPlayer.year && cfbdPlayer.year >= 3,
          power_4: false, // Will be updated based on conference
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        if (existingPlayers.documents.length > 0) {
          // Update existing player
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.players,
            existingPlayers.documents[0].$id,
            {
              ...playerData,
              updated_at: new Date().toISOString()
            }
          );
          updatedCount++;
        } else {
          // Create new player
          await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.players,
            ID.unique(),
            playerData
          );
          createdCount++;
        }
      } catch (error) {
        console.error(`Error processing player ${cfbdPlayer.first_name} ${cfbdPlayer.last_name}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_fetched: cfbdPlayers.length,
        fantasy_players: fantasyPlayers.length,
        created: createdCount,
        updated: updatedCount,
        errors: errorCount
      },
      message: `Successfully processed ${fantasyPlayers.length} fantasy players`
    });

  } catch (error) {
    console.error('Error fetching CFBD players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CFBD players', details: error.message },
      { status: 500 }
    );
  }
}

function getYearString(year: number): string {
  switch (year) {
    case 1: return 'FR';
    case 2: return 'SO';
    case 3: return 'JR';
    case 4: return 'SR';
    case 5: return 'GR';
    default: return 'FR';
  }
} 