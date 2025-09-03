import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params
    
    // Security: only allow .html files
    if (!file.endsWith('.html')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }
    
    // Construct the file path
    const filePath = path.join(process.cwd(), 'docs', 'diagrams', 'draft-diagrams', file)
    
    // Read the file
    const content = await readFile(filePath, 'utf-8')
    
    // Return with proper content type and allow iframe embedding
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
        // Allow iframe embedding
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'"
      }
    })
  } catch (error) {
    console.error('Error serving diagram:', error)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
