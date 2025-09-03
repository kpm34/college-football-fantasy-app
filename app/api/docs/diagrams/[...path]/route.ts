import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'public', 'docs', 'diagrams', filePath)
    
    // Security check - prevent directory traversal
    if (fullPath.includes('..')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
    
    // Read the file
    const fileContent = fs.readFileSync(fullPath, 'utf-8')
    
    // Determine content type
    const contentType = fullPath.endsWith('.drawio') 
      ? 'application/xml' 
      : fullPath.endsWith('.md')
      ? 'text/markdown'
      : 'text/plain'
    
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error serving diagram:', error)
    return NextResponse.json(
      { error: 'Failed to serve diagram' },
      { status: 500 }
    )
  }
}
