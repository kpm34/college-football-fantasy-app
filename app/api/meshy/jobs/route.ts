import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases } from '@lib/appwrite-server'
import { DATABASE_ID } from '@lib/appwrite'
import { ID } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const COLLECTION_ID = 'meshy_jobs'

export async function POST(req: NextRequest) {
  try {
    const { mode, prompt, imageUrl, baseModelUrl, userId, metadata, webhookSecret } = await req.json()
    if (!prompt && !imageUrl && !baseModelUrl) {
      return NextResponse.json({ error: 'Provide prompt, imageUrl, or baseModelUrl' }, { status: 400 })
    }
    // Build payload only with attributes that exist in the collection to avoid
    // Appwrite "Unknown attribute" errors on environments where attributes aren't created yet.
    let allowedKeys = new Set<string>()
    try {
      const col: any = await databases.getCollection(DATABASE_ID, COLLECTION_ID)
      for (const attr of col?.attributes || []) {
        if (attr?.key) allowedKeys.add(attr.key as string)
      }
    } catch {}

    const candidate: Record<string, unknown> = {
      status: 'QUEUED',
      mode: mode || 'text-to-3d',
      prompt: prompt || '',
      imageUrl: imageUrl || '',
      baseModelUrl: baseModelUrl || '',
      resultUrl: '',
      userId: userId || null,
      webhookSecret: webhookSecret || null,
      createdAt: new Date().toISOString(),
      // metadata intentionally omitted unless attribute exists
      metadata
    }

    const payload: Record<string, unknown> = {}
    if (allowedKeys.size > 0) {
      for (const [k, v] of Object.entries(candidate)) {
        if (allowedKeys.has(k)) payload[k] = v
      }
    }

    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      allowedKeys.size > 0 ? payload : {}
    )
    return NextResponse.json({ id: doc.$id, status: 'QUEUED' })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to create meshy job' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status, resultUrl, error } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const update: any = { status, updatedAt: new Date().toISOString() }
    if (resultUrl) update.resultUrl = resultUrl
    if (error) update.error = error
    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, id, update)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update meshy job' }, { status: 500 })
  }
}


