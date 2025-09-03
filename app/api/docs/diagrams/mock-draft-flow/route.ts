import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const fullPath = path.join(
      process.cwd(),
      'docs',
      'diagrams',
      'draft-diagrams',
      'mock-draft-flow.drawio'
    )

    // Debug logging
    console.log('Serving mock draft flow diagram:', { fullPath, exists: fs.existsSync(fullPath) })

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'Diagram file not found' }, { status: 404 })
    }

    // Read the file
    const fileContent = fs.readFileSync(fullPath, 'utf-8')

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range, Accept',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': `inline; filename="mock-draft-flow.drawio"`,
      },
    })
  } catch (error) {
    console.error('Error serving mock draft flow diagram:', error)
    return NextResponse.json({ error: 'Failed to serve diagram' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range, Accept',
      'Access-Control-Max-Age': '86400',
    },
  })
}
