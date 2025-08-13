import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID } from 'node-appwrite';
import { APPWRITE_CONFIG } from '@/lib/appwrite-config';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const resolvedParams = await params;
    const leagueId = resolvedParams.leagueId;
    const body = await request.json();
    const { playerId, pick, userId } = body;
    
    // Validate request
    if (!playerId || !pick) {
      return NextResponse.json(
        { error: 'Missing required fields: playerId and pick' },
        { status: 400 }
      );
    }
    
    // Persist pick and update roster
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId)
      .setKey(APPWRITE_CONFIG.apiKey);

    const databases = new Databases(client);
    const databaseId = APPWRITE_CONFIG.databaseId;

    // 1) Create draft pick document
    const pickDoc = await databases.createDocument(
      databaseId,
      'draft_picks',
      ID.unique(),
      {
        leagueId,
        playerId,
        userId,
        pickNumber: pick,
        timestamp: new Date().toISOString(),
      }
    );

    // 2) Append player to user's roster document
    // Find roster by leagueId and userId
    // Note: Keeping simple; real impl should use Queries and proper indexes
    try {
      const rosters = await databases.listDocuments(databaseId, 'rosters');
      const userRoster = rosters.documents.find((r: any) => r.league_id === leagueId && r.user_id === userId);
      if (userRoster) {
        const updatedBench = Array.isArray(userRoster.bench) ? [...userRoster.bench, playerId] : [playerId];
        await databases.updateDocument(databaseId, 'rosters', userRoster.$id, { bench: updatedBench, updated_at: new Date().toISOString() });
      }
    } catch (e) {
      console.log('Roster update skipped or failed', e);
    }

    return NextResponse.json({ success: true, pick: pickDoc });
    
  } catch (error) {
    console.error('Error processing draft pick:', error);
    return NextResponse.json(
      { error: 'Failed to process draft pick' },
      { status: 500 }
    );
  }
} 