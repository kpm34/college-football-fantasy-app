import { NextRequest, NextResponse } from 'next/server'
import { serverStorage as storage } from '@lib/appwrite-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest) {
  try {
    // List recent files in blender-exports bucket
    const files = await storage.listFiles('blender-exports')
    const sorted = (files.files as any[]).sort((a, b) => (b.$createdAt || '').localeCompare(a.$createdAt || ''))
    return NextResponse.json({ files: sorted.map(f => ({ fileId: f.$id, name: f.name, size: f.sizeOriginal, createdAt: f.$createdAt })) })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to list exports' }, { status: 500 })
  }
}


