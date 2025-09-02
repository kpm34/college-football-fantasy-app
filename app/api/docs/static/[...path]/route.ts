import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = join(process.cwd(), 'docs', filePath)
    
    // Security: Only allow HTML files from docs/diagrams
    if (!filePath.startsWith('diagrams/') || !filePath.endsWith('.html')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }
    
    if (!existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    const content = readFileSync(fullPath, 'utf-8')
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving static file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
