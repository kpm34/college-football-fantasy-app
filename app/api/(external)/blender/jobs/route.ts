import { NextRequest, NextResponse } from 'next/server'
import { serverDatabases as databases, serverStorage as storage } from '@lib/appwrite-server'
import { DATABASE_ID, COLLECTIONS } from '@lib/appwrite'
import { ID } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST: enqueue a blender job
export async function POST(req: NextRequest) {
  try {
    const { inputGlbUrl, prompt, ops, fantasyTeamId } = await req.json()
    if (!inputGlbUrl) return NextResponse.json({ error: 'inputGlbUrl required' }, { status: 400 })

    const doc = await databases.createDocument(
      DATABASE_ID,
      (COLLECTIONS as any)?.blender_jobs || 'blender_jobs',
      ID.unique(),
      {
        status: 'QUEUED',
        inputGlbUrl,
        prompt: String(prompt || ''),
        ops: ops || [],
        teamId: fantasyTeamId || null,
        createdAt: new Date().toISOString()
      }
    )
    return NextResponse.json({ id: doc.$id, status: 'QUEUED' })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to enqueue job' }, { status: 500 })
  }
}

// GET: workers poll next job (minimal; secure by API key header in practice)
export async function GET() {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      (COLLECTIONS as any)?.blender_jobs || 'blender_jobs',
      []
    )
    const next = res.documents.find((d: any) => d.status === 'QUEUED')
    if (!next) return NextResponse.json({ job: null })
    // mark running
    await databases.updateDocument(
      DATABASE_ID,
      (COLLECTIONS as any)?.blender_jobs || 'blender_jobs',
      next.$id,
      { status: 'RUNNING', startedAt: new Date().toISOString() }
    )
    return NextResponse.json({ job: next })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch job' }, { status: 500 })
  }
}

// PATCH: worker updates status and output url
export async function PATCH(req: NextRequest) {
  try {
    const { id, status, outputGlbUrl, error } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const update: any = { status }
    if (outputGlbUrl) update.outputGlbUrl = outputGlbUrl
    if (error) update.error = error
    update.updatedAt = new Date().toISOString()
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS?.BLENDER_JOBS || 'blender_jobs',
      id,
      update
    )
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update job' }, { status: 500 })
  }
}


