import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { RotowireScraper } from '@/lib/rotowire/scraper';

export const runtime = 'nodejs'; // Required for Playwright

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const player = searchParams.get('player');
    const team = searchParams.get('team');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    // Create cache key
    const cacheKey = `rotowire:news:${player || team || 'all'}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await kv.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          data: cached,
          source: 'cache',
          cachedAt: new Date().toISOString()
        });
      }
    }
    
    // Initialize scraper
    const scraper = new RotowireScraper();
    
    try {
      await scraper.initialize();
      await scraper.login();
      
      // Get news
      let news = await scraper.getCollegeFootballNews();
      
      // Filter by player or team if requested
      if (player) {
        news = news.filter(item => 
          item.player?.toLowerCase().includes(player.toLowerCase())
        );
      }
      
      if (team) {
        news = news.filter(item => 
          item.team?.toLowerCase().includes(team.toLowerCase())
        );
      }
      
      // Cache for 1 hour
      await kv.setex(cacheKey, 3600, JSON.stringify(news));
      
      return NextResponse.json({
        data: news,
        source: 'live',
        count: news.length,
        fetchedAt: new Date().toISOString()
      });
      
    } finally {
      await scraper.close();
    }
    
  } catch (error: any) {
    console.error('Rotowire news error:', error);
    
    // Try to return cached data on error
    const cacheKey = 'rotowire:news:all';
    const cached = await kv.get(cacheKey);
    
    if (cached) {
      return NextResponse.json({
        data: cached,
        source: 'cache-fallback',
        error: 'Using cached data due to error'
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Rotowire news', message: error.message },
      { status: 500 }
    );
  }
}
