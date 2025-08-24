import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases } from '@lib/appwrite-server'
import { DATABASE_ID } from '@lib/appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COLLECTION_ID = 'meshy_jobs'

export async function POST(req: NextRequest) {
  try {
    // Optional secret verification (Meshy can send a secret; support header or query)
    const expected = process.env.MESHY_WEBHOOK_SECRET
    if (expected) {
      const url = new URL(req.url)
      const fromQuery = url.searchParams.get('secret')
      const fromHeader = req.headers.get('x-meshy-signature') || req.headers.get('x-webhook-secret')
      if (fromQuery !== expected && fromHeader !== expected) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
    }

    // Meshy webhook: { id, status, resultUrl, error }
    const body = await req.json()
    const { id, status, resultUrl, error } = body || {}
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const update: any = { status, updatedAt: new Date().toISOString() }
    if (resultUrl) update.resultUrl = resultUrl
    if (error) update.error = error
    try {
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, update)
    } catch {
      // Upsert: if doc doesn't exist, create it with allowed attributes only
      let allowedKeys = new Set<string>()
      try {
        const col: any = await databases.getCollection(DATABASE_ID, COLLECTION_ID)
        for (const attr of col?.attributes || []) if (attr?.key) allowedKeys.add(attr.key as string)
      } catch {}
      const payload: Record<string, unknown> = {}
      const base: Record<string, unknown> = { status, resultUrl: resultUrl || '', error: error || '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      if (allowedKeys.size > 0) {
        for (const [k, v] of Object.entries(base)) if (allowedKeys.has(k)) payload[k] = v
      }
      await databases.createDocument(DATABASE_ID, COLLECTION_ID, id, allowedKeys.size > 0 ? payload : {})
    }

    // Optional: enqueue a blender job using resultUrl
    // This keeps the pipeline hands-off as soon as Meshy finishes
    if (resultUrl && status === 'COMPLETE') {
      try {
        await databases.createDocument(DATABASE_ID, 'blender_jobs', id, {
          status: 'QUEUED',
          inputGlbUrl: resultUrl,
          prompt: 'Auto optimize from Meshy',
          ops: JSON.stringify([{ type: 'decimate_to_ratio', ratio: 0.6 }]),
          createdAt: new Date().toISOString()
        })
      } catch {}
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to handle webhook' }, { status: 500 })
  }
}


