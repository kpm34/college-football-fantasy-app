import { NextRequest, NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  try {
    const p = path.join(process.cwd(), 'docs', 'diagrams', 'project-map', '_inventory.json')
    const raw = fs.readFileSync(p, 'utf-8')
    const json = JSON.parse(raw)
    return NextResponse.json(json)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to read inventory' }, { status: 500 })
  }
}


