import { NextRequest, NextResponse } from 'next/server';
import { invalidateCache } from '@lib/cache';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // Note: In production, protect this endpoint
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { pattern } = await request.json();

    if (!pattern) {
      return NextResponse.json(
        { error: 'Pattern is required' },
        { status: 400 }
      );
    }

    // Validate pattern to prevent accidents
    if (pattern === '*' && !request.headers.get('x-confirm-clear-all')) {
      return NextResponse.json(
        { error: 'Clearing all cache requires confirmation header' },
        { status: 400 }
      );
    }

    await invalidateCache(pattern);

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for pattern: ${pattern}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}
