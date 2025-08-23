import { NextRequest, NextResponse } from 'next/server'
import { serverStorage as storage } from '@lib/appwrite-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function ensureBucket(bucketId: string, name: string) {
  try {
    await storage.getBucket(bucketId)
    return { bucketId, existed: true }
  } catch {
    const created = await storage.createBucket(bucketId, name)
    return { bucketId: created.$id, created: true }
  }
}

export async function GET(_req: NextRequest) {
  try {
    const results = [] as Array<Record<string, unknown>>
    for (const [id, name] of [
      ['meshy-templates', 'Meshy Templates'],
      ['blender-exports', 'Blender Exports']
    ] as const) {
      results.push(await ensureBucket(id, name))
    }
    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to ensure buckets' }, { status: 500 })
  }
}


