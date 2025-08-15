import { NextRequest } from 'next/server'
import { serverStorage as storage } from '@/lib/appwrite-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { fileId: string } }) {
  const res = await storage.getFileDownload('blender-exports', params.fileId)
  return new Response(res.body, {
    headers: {
      'content-type': 'model/gltf-binary',
      'cache-control': 'public, max-age=31536000, immutable'
    }
  })
}


