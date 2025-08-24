/**
 * Player Search API - Edge Function
 * Runs at the edge for ultra-low latency
 */

import { NextRequest, NextResponse } from 'next/server';

// Mark as Edge Function
export const runtime = 'edge';

// Optional: Configure regions
export const preferredRegion = ['iad1', 'sfo1']; // US East & West

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const position = searchParams.get('position');
  const conference = searchParams.get('conference');
  const available = searchParams.get('available') === 'true';
  const leagueId = searchParams.get('leagueId');
  const limit = parseInt(searchParams.get('limit') || '20');

  // Quick validation at the edge
  if (!query && !position && !conference) {
    return NextResponse.json(
      { error: 'Please provide a search query, position, or conference' },
      { status: 400 }
    );
  }

  // Hot-path bypass: for very short queries, skip KV and origin lookups
  if (query.trim().length > 0 && query.trim().length < 2) {
    return NextResponse.json(
      { players: [] },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store',
          'X-Bypass': 'short-query'
        }
      }
    );
  }

  // Check edge cache first (Vercel Edge Cache)
  const cacheKey = `player-search:${JSON.stringify({ query, position, conference, available, leagueId })}`;
  
  // Try to get from KV if available (ultra-fast at edge)
  if (process.env.KV_REST_API_URL) {
    try {
      const cached = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(cacheKey)}`, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`
        }
      });
      
      if (cached.ok) {
        const data = await cached.json();
        if (data.result) {
          return NextResponse.json(JSON.parse(data.result), {
            headers: {
              'X-Cache': 'HIT',
              'Cache-Control': 'public, max-age=60, s-maxage=300'
            }
          });
        }
      }
    } catch (error) {
      console.warn('KV cache miss:', error);
    }
  }

  // Forward to origin API for full search
  const originUrl = new URL('/api/players/cached', request.url);
  originUrl.search = searchParams.toString();
  
  const response = await fetch(originUrl.toString(), {
    headers: {
      // Forward authentication if present
      cookie: request.headers.get('cookie') || '',
    }
  });

  const data = await response.json();

  // Cache successful responses
  if (response.ok && process.env.KV_REST_API_URL) {
    try {
      await fetch(`${process.env.KV_REST_API_URL}/set`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: cacheKey,
          value: JSON.stringify(data),
          ex: 300 // 5 minute TTL
        })
      });
    } catch (error) {
      console.warn('Failed to cache:', error);
    }
  }

  return NextResponse.json(data, {
    status: response.status,
    headers: {
      'X-Cache': 'MISS',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
      'X-Edge-Region': process.env.VERCEL_REGION || 'unknown'
    }
  });
}

/**
 * Prefetch popular searches at edge
 */
export async function POST(request: NextRequest) {
  // This could be used to warm the cache with popular searches
  const { searches } = await request.json();
  
  if (!Array.isArray(searches)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const results = await Promise.all(
    searches.map(async (search) => {
      const url = new URL('/api/players/search', request.url);
      Object.entries(search).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
      
      const response = await fetch(url.toString());
      return { 
        search, 
        cached: response.headers.get('X-Cache') === 'HIT' 
      };
    })
  );

  return NextResponse.json({ 
    prefetched: results.filter(r => r.cached).length,
    total: results.length 
  });
}
