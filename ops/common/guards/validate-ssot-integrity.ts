import { Client, Databases } from 'node-appwrite'
import { SCHEMA_REGISTRY, COLLECTIONS } from '../../../schema/zod-schema'

function getEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

async function main() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
  const apiKey = process.env.APPWRITE_API_KEY
  if (!apiKey) throw new Error('APPWRITE_API_KEY required')

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
  const databases = new Databases(client)
  const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'

  const { collections } = await databases.listCollections(dbId)
  const existing = new Map(collections.map((c: any) => [c.$id, c]))

  const requiredIds = Object.values(COLLECTIONS)
  const missing = requiredIds.filter((id) => !existing.has(id))

  // Attribute presence check (minimal): ensure required attributes from SSOT appear in Appwrite attributes
  const attrIssues: string[] = []
  for (const [id, schema] of Object.entries(SCHEMA_REGISTRY)) {
    const col = existing.get(id)
    if (!col) continue
    const attributes = (col.attributes || []) as Array<{ key: string; required?: boolean }>
    // derive required keys from zod: best-effort via _def.shape since schemas defined with z.object
    const shape = (schema as any)?._def?.shape()
    if (!shape) continue
    const requiredKeys = Object.entries(shape)
      .filter(([, def]: any) => !def?.isOptional?.())
      .map(([k]) => k)

    for (const key of requiredKeys) {
      const found = attributes.some((a) => a.key === key)
      if (!found) attrIssues.push(`${id}: missing required attribute '${key}'`)
    }
  }

  if (missing.length || attrIssues.length) {
    console.error('SSOT integrity FAILED')
    if (missing.length) console.error('Missing collections:', missing.join(','))
    if (attrIssues.length) console.error('Attribute issues:', attrIssues.join(' | '))
    process.exit(1)
  }

  console.log('SSOT integrity: PASS')
}

main().catch((e) => {
  console.error('Guard error:', e?.message || e)
  process.exit(1)
})
