import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params
    const fileName = pathSegments.join('/')

    // Security: only allow .drawio files from draft-diagrams folder
    if (!fileName.endsWith('.drawio') || fileName.includes('..')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Construct the file path
    const filePath = path.join(
      process.cwd(),
      'public',
      'docs',
      'diagrams',
      'draft-diagrams',
      fileName
    )

    // Read the file
    const content = await readFile(filePath, 'utf-8')

    // Return with proper content type and CORS headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving diagram:', error)
    return NextResponse.json({ error: 'Failed to load diagram file' }, { status: 404 })
  }
}
