import { NextRequest } from 'next/server'
import { serverStorage as storage } from '@/lib/appwrite-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params
  const res = await storage.getFileDownload('blender-exports', fileId)
  return new Response(res.body, {
    headers: {
      'content-type': 'model/gltf-binary',
      'cache-control': 'public, max-age=31536000, immutable'
    }
  })
}


