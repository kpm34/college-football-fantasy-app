import fs from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

interface DiagramItem {
  file: string
  title: string
  group: 'Flows' | 'Operations' | 'Endpoints' | 'Timing'
}

export async function GET() {
  try {
    const diagramsDir = path.join(process.cwd(), 'docs', 'diagrams', 'draft-diagrams')

    if (!fs.existsSync(diagramsDir)) {
      return NextResponse.json({ items: [] })
    }

    const files = fs
      .readdirSync(diagramsDir)
      .filter(file => file.endsWith('.drawio'))
      .map(file => {
        const title = file
          .replace('.drawio', '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())

        let group: DiagramItem['group'] = 'Flows'
        if (file.includes('timing')) group = 'Timing'
        else if (file.includes('endpoint') || file.includes('api')) group = 'Endpoints'
        else if (file.includes('operation') || file.includes('system')) group = 'Operations'

        return {
          file: `draft-diagrams/${file}`,
          title,
          group,
        }
      })

    return NextResponse.json({ items: files })
  } catch (error) {
    console.error('Error listing diagrams:', error)
    return NextResponse.json({ error: 'Failed to list diagrams' }, { status: 500 })
  }
}
