import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases } from '@lib/appwrite-server'
import { DATABASE_ID } from '@lib/appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COLLECTION_ID = 'meshy_jobs'

export async function GET(_req: NextRequest) {
  try {
    let existed = false
    try {
      await databases.getCollection(DATABASE_ID, COLLECTION_ID)
      existed = true
    } catch {
      await databases.createCollection(DATABASE_ID, COLLECTION_ID, COLLECTION_ID)
    }

    const ensureString = async (key: string, size = 1024, required = false, def?: string) => {
      try { await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, key, size, required, def) } catch {}
    }
    const ensureDatetime = async (key: string, required = false) => {
      try { await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_ID, key, required) } catch {}
    }

    await Promise.all([
      ensureString('status', 20, false, 'QUEUED'),
      ensureString('mode', 32, false),
      ensureString('prompt', 2048, false),
      ensureString('imageUrl', 1024, false),
      ensureString('baseModelUrl', 1024, false),
      ensureString('resultUrl', 1024, false),
      ensureString('client_id', 128, false),
      ensureString('webhookSecret', 256, false),
      ensureString('error', 1024, false),
      ensureDatetime('createdAt', true),
      ensureDatetime('updatedAt', false)
    ])

    try { await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'status_idx', 'key', ['status']) } catch {}
    try { await databases.createIndex(DATABASE_ID, COLLECTION_ID, 'created_desc', 'key', ['createdAt'], ['DESC']) } catch {}

    return NextResponse.json({ ok: true, existed: existed || false, $id: COLLECTION_ID })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to ensure collection' }, { status: 500 })
  }
}


