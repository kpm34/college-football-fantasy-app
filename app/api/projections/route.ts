import { NextRequest, NextResponse } from 'next/server';
import { CFBProjectionsService } from '@/lib/services/cfb-projections.service';
import { NextRequest, NextResponse } from 'next/server';
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
      // Fallback to on-the-fly calculation service
      if (mode === 'weekly' && week) {
        projections = await CFBProjectionsService.getWeeklyProjections(
          parseInt(week, 10),
          conference || undefined,
          position || undefined
        );
      } else {
        projections = await CFBProjectionsService.getSeasonProjections(
          conference || undefined,
          position || undefined
        );
      }
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
