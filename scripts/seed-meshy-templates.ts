/*
  Seed Meshy-generated mascot templates into Appwrite.
  Usage:
    tsx scripts/seed-meshy-templates.ts
  Env required:
    APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID
    MESHY_API_KEY
*/

import 'node-fetch';
import { Client, Databases } from 'node-appwrite';

type TextureStyle = 'stylized' | 'pbr' | 'cartoon' | 'realistic'

const MESHY_API_BASE = 'https://api.meshy.ai/v2'
const MESHY_API_KEY = process.env.MESHY_API_KEY || ''

if (!MESHY_API_KEY) {
  console.error('MESHY_API_KEY missing')
  process.exit(1)
}

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || ''

if (!APPWRITE_API_KEY) {
  console.error('APPWRITE_API_KEY missing')
  process.exit(1)
}

const MASCOT_TEMPLATES_COLLECTION = 'mascot_templates'

async function createMeshyJob(prompt: string, textureStyle: TextureStyle = 'stylized'): Promise<string> {
  const res = await fetch(`${MESHY_API_BASE}/text-to-3d`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MESHY_API_KEY}`,
    },
    body: JSON.stringify({
      mode: 'fast',
      prompt,
      art_style: 'cartoon',
      texture_style: textureStyle,
    }),
  })
  if (!res.ok) throw new Error(`Meshy create failed: ${res.status} ${await res.text()}`)
  const data = (await res.json()) as { result: string }
  return data.result
}

async function pollMeshy(jobId: string): Promise<{ glbUrl: string; preview?: string }> {
  for (;;) {
    const res = await fetch(`${MESHY_API_BASE}/text-to-3d/${jobId}`, {
      headers: { Authorization: `Bearer ${MESHY_API_KEY}` },
    })
    if (!res.ok) throw new Error(`Meshy poll failed: ${res.status} ${await res.text()}`)
    const data = (await res.json()) as any
    const status = data.status as string
    if (status === 'succeeded' && data.assets?.glb) {
      return { glbUrl: data.assets.glb as string, preview: data.assets.preview as string | undefined }
    }
    if (status === 'failed') {
      throw new Error(`Meshy job failed: ${data.error || 'unknown error'}`)
    }
    await new Promise((r) => setTimeout(r, 3000))
  }
}

async function main() {
  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY)
  const databases = new Databases(client)

  const seeds: Array<{ slug: string; name: string; prompt: string }> = [
    { slug: 'wolf_mascot_stylized', name: 'Wolf Mascot', prompt: 'A fierce wolf college football mascot, heroic pose, stylized, clean topology, game-ready' },
    { slug: 'spartan_mascot_stylized', name: 'Spartan Mascot', prompt: 'A Spartan warrior college football mascot with helmet and plume, stylized, clean topology, game-ready' },
    { slug: 'tiger_mascot_stylized', name: 'Tiger Mascot', prompt: 'A roaring tiger college football mascot, stylized, optimized for real-time, clean topology' },
  ]

  for (const seed of seeds) {
    try {
      console.log(`Creating Meshy job for: ${seed.name}`)
      const jobId = await createMeshyJob(seed.prompt, 'stylized')
      console.log(`Job ${jobId} submitted. Polling...`)
      const { glbUrl, preview } = await pollMeshy(jobId)
      console.log(`Meshy complete for ${seed.name}: ${glbUrl}`)

      const metaJson = JSON.stringify({
        version: 1,
        units: 'meters',
        scaleHint: 1.0,
        anchors: { helmet: { position: [0, 0.3, 0], rotation: [0, 0, 0], scale: 1.0 } },
        materials: { primary: '#6C2BD9', secondary: '#FF2E9A', accent: '#FFC300' },
        source: 'meshy',
      })

      // Upsert by slug: try find existing
      let existsId: string | undefined
      try {
        const list = await databases.listDocuments(APPWRITE_DATABASE_ID, MASCOT_TEMPLATES_COLLECTION, [
          // Appwrite Query.equal not available in server SDK directly here; use string
          `slug=${seed.slug}`,
          'limit=1',
        ])
        if (list.documents?.length) existsId = (list.documents[0] as any).$id as string
      } catch {}

      if (existsId) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, MASCOT_TEMPLATES_COLLECTION, existsId, {
          kind: 'MASCOT',
          name: seed.name,
          slug: seed.slug,
          glbUrl,
          thumbnailUrl: preview,
          metaJson,
          isDefault: false,
        })
        console.log(`Updated existing template: ${seed.slug}`)
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, MASCOT_TEMPLATES_COLLECTION, 'unique()', {
          kind: 'MASCOT',
          name: seed.name,
          slug: seed.slug,
          glbUrl,
          thumbnailUrl: preview,
          metaJson,
          isDefault: false,
        })
        console.log(`Created template: ${seed.slug}`)
      }
    } catch (e) {
      console.error(`Seed failed for ${seed.name}:`, e)
    }
  }

  console.log('Seeding complete')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


