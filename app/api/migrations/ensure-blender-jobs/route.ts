import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases } from '@lib/appwrite-server'
import { DATABASE_ID } from '@lib/appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COLLECTION_ID = 'blender_jobs'

export async function GET(_req: NextRequest) {
  try {
    // If exists, return quickly
    try {
      const c = await databases.getCollection(DATABASE_ID, COLLECTION_ID)
      return NextResponse.json({ ok: true, existed: true, $id: c.$id })
    } catch {}

    // Create collection
    const created = await databases.createCollection(DATABASE_ID, COLLECTION_ID, COLLECTION_ID)

    // Attributes
    const addString = (key: string, size = 255, required = false, defaultValue?: string) =>
      databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, key, size, required, defaultValue)
    const addDatetime = (key: string, required = false) =>
      databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, key, required)
    const addUrl = (key: string, required = false) => addString(key, 1024, required)

    await Promise.all([
      addString('status', 20, true, 'QUEUED'),
      addUrl('inputGlbUrl', true),
      addUrl('outputGlbUrl', false),
      addString('prompt', 1024, false),
      addString('ops', 8192, false),
      addString('teamId', 64, false),
      addString('error', 1024, false),
      addDatetime('createdAt', true),
      addDatetime('startedAt', false),
      addDatetime('updatedAt', false)
    ])

    // Indexes
    try { await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'status_idx', 'key', ['status']) } catch {}
    try { await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'created_desc', 'key', ['createdAt'], ['DESC']) } catch {}

    return NextResponse.json({ ok: true, created: true, $id: created.$id })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to ensure collection' }, { status: 500 })
  }
}


