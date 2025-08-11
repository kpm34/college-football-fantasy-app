import { NextRequest, NextResponse } from 'next/server';
import { CFBProjectionsService } from '@/lib/services/cfb-projections.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'season';
    const week = searchParams.get('week');
    const conference = searchParams.get('conference');
    const position = searchParams.get('position');
    
    let projections;
    
    if (mode === 'weekly' && week) {
      projections = await CFBProjectionsService.getWeeklyProjections(
        parseInt(week),
        conference || undefined,
        position || undefined
      );
    } else {
      projections = await CFBProjectionsService.getSeasonProjections(
        conference || undefined,
        position || undefined
      );
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
