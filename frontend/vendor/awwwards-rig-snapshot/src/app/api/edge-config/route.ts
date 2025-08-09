import { get, getAll } from '@vercel/edge-config'
import { NextResponse } from 'next/server'

/**
 * Edge Config verification endpoint
 * Test at: http://localhost:3000/api/edge-config
 */
export async function GET() {
  try {
    // Check if Edge Config is configured
    if (!process.env.EDGE_CONFIG) {
      return NextResponse.json(
        {
          error: 'Edge Config not configured',
          message: 'EDGE_CONFIG environment variable is missing. Run: vercel env pull',
        },
        { status: 500 }
      )
    }

    // Fetch specific flags in parallel
    const [enableWebGL, heroVariant, chatEnabled] = await Promise.all([
      get<boolean>('enableWebGL'),
      get<string>('heroVariant'),
      get<boolean>('chatEnabled'),
    ])

    // Also fetch all flags for complete view
    const allFlags = await getAll()

    return NextResponse.json({
      status: 'success',
      configured: true,
      flags: {
        enableWebGL,
        heroVariant,
        chatEnabled,
      },
      allFlags,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Edge Config error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch Edge Config',
        message: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure EDGE_CONFIG is set and valid',
      },
      { status: 500 }
    )
  }
}