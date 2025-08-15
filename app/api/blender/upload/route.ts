import { NextRequest, NextResponse } from 'next/server'
import { serverStorage as storage, serverDatabases as databases } from '@/lib/appwrite-server'
import { ID, InputFile } from 'node-appwrite'
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const jobId = String(form.get('jobId') || '')
    if (!file || !jobId) return NextResponse.json({ error: 'file and jobId required' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const created = await storage.createFile(
      'blender-exports',
      ID.unique(),
      InputFile.fromBuffer(buffer, file.name || 'export.glb')
    )

    const fileId = created.$id
    const outputGlbUrl = `/api/blender/file/${fileId}`

    // Update job
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS?.BLENDER_JOBS || 'blender_jobs',
        jobId,
        { status: 'COMPLETE', outputGlbUrl, updatedAt: new Date().toISOString() }
      )
    } catch {}

    return NextResponse.json({ success: true, fileId, outputGlbUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}


