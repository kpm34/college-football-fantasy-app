import { NextRequest, NextResponse } from 'next/server';
import { ProjectionsService } from '@/lib/services/projections.service';
import { Databases, Query, Client } from 'node-appwrite';
import { env } from '@/core/config/environment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'season';
    const week = searchParams.get('week');
    const conference = searchParams.get('conference');
    const position = searchParams.get('position');
    const source = searchParams.get('source') || 'db'; // 'db' or 'calc'
    
    let projections: any;
    
    if (source === 'db') {
      // Serve from Appwrite collections when available
      const client = new Client()
        .setEndpoint(env.server.appwrite.endpoint)
        .setProject(env.server.appwrite.projectId)
        .setKey(env.server.appwrite.apiKey);
      const databases = new Databases(client);

      if (mode === 'weekly' && week) {
        const queries: any[] = [
          Query.equal('season', new Date().getFullYear()),
          Query.equal('week', parseInt(week, 10)),
          Query.limit(1000)
        ];
        if (position) queries.push(Query.equal('position', position));
        const res = await databases.listDocuments(env.server.appwrite.databaseId, 'projections_weekly', queries);
        projections = res.documents;
      } else {
        const queries: any[] = [
          Query.equal('season', new Date().getFullYear()),
          Query.limit(2000)
        ];
        if (position) queries.push(Query.equal('position', position));
        const res = await databases.listDocuments(env.server.appwrite.databaseId, 'projections_yearly', queries);
        projections = res.documents;
      }
    } else {
      // Fallback to calculating from college_players data
      const client = new Client()
        .setEndpoint(env.server.appwrite.endpoint)
        .setProject(env.server.appwrite.projectId)
        .setKey(env.server.appwrite.apiKey);
      const databases = new Databases(client);

      const queries: any[] = [Query.limit(1000)];
      if (position) queries.push(Query.equal('position', position));
      if (conference) queries.push(Query.equal('conference', conference));
      
      const playersResponse = await databases.listDocuments(
        env.server.appwrite.databaseId, 
        'college_players', 
        queries
      );
      
      projections = playersResponse.documents.map((player: any) => ({
        playerId: player.$id,
        playerName: player.name,
        position: player.position,
        team: player.team,
        conference: player.conference,
        projectedPoints: player.projection || 100,
        fantasyPoints: player.projection || 100,
        confidence: 0.75,
        adp: 100,
        valueScore: 0.7
      }));
    }
    
    return NextResponse.json({ success: true, data: projections });
  } catch (error) {
    console.error('Error fetching projections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projections' },
      { status: 500 }
    );
  }
}
