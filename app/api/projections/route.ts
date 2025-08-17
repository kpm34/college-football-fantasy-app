import { NextResponse } from 'next/server';

/**
 * ❌ DEPRECATED ENDPOINT - REMOVED
 * 
 * This endpoint has been removed as of August 17, 2025.
 * It used outdated projection calculations without proper depth chart multipliers.
 * 
 * 🔄 MIGRATION GUIDE:
 * 
 * Old usage: /api/projections?position=QB&conference=SEC
 * New usage: /api/draft/players?position=QB&conference=SEC&orderBy=projection
 * 
 * Enhanced endpoints with depth chart logic:
 * - /api/draft/players - Draft-ready players with enhanced projections
 * - /api/players/cached - Cached player data with projections
 * 
 * Key improvements in new endpoints:
 * - ✅ Depth chart multipliers (starters vs backups)
 * - ✅ Enhanced QB differentiation (QB1: ~340pts, QB2: ~85pts)  
 * - ✅ Team-specific pace and role adjustments
 * - ✅ Conference strength modifiers
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'DEPRECATED_ENDPOINT_REMOVED',
      message: 'This projections endpoint has been removed. Use /api/draft/players instead.',
      migration: {
        oldEndpoint: '/api/projections',
        newEndpoint: '/api/draft/players',
        alternativeEndpoint: '/api/players/cached',
        documentation: 'See CLAUDE.md for enhanced projection system details'
      },
      removedDate: '2025-08-17',
      reason: 'Replaced with enhanced depth chart projection system'
    },
    { status: 410 } // 410 Gone - resource permanently removed
  );
}
