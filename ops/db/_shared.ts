import fs from 'node:fs'
import path from 'node:path'
import { Client, Databases, Query } from 'node-appwrite'

export interface Summary {
  scanned: number
  created?: number
  updated?: number
  skipped?: number
  errors?: number
  notes?: Record<string, unknown>
}

export function envOrThrow(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback
  if (!v) throw new Error(`Missing env ${name}`)
  return v.replace(/^"|"$/g, '').trim()
}

export function getDatabases(): { databases: Databases; databaseId: string } {
  const endpoint = envOrThrow('APPWRITE_ENDPOINT', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  const projectId = envOrThrow('APPWRITE_PROJECT_ID', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  const apiKey = envOrThrow('APPWRITE_API_KEY')
  const databaseId = envOrThrow('APPWRITE_DATABASE_ID', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID)
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const databases = new Databases(client)
  return { databases, databaseId }
}

export const BATCH_LIMIT = 200

export async function* paginate(databases: Databases, databaseId: string, collectionId: string, baseQueries: any[] = []) {
  let cursor: string | undefined
  while (true) {
    const queries = [...baseQueries, Query.limit(BATCH_LIMIT)] as any[]
    if (cursor) queries.push(Query.cursorAfter(cursor) as any)
    const page = await databases.listDocuments(databaseId, collectionId, queries)
    if (page.total === 0 || page.documents.length === 0) break
    for (const doc of page.documents) yield doc
    if (page.documents.length < BATCH_LIMIT) break
    cursor = page.documents[page.documents.length - 1].$id
  }
}

export async function safeCreateOrUpdate(databases: Databases, databaseId: string, collectionId: string, id: string, data: Record<string, any>): Promise<'created'|'updated'|'skipped'> {
  try {
    await databases.createDocument(databaseId, collectionId, id, data)
    return 'created'
  } catch (e: any) {
    // If exists, update
    if (String(e?.message || '').toLowerCase().includes('already exists') || e?.code === 409) {
      await databases.updateDocument(databaseId, collectionId, id, data)
      return 'updated'
    }
    // Unknown error: rethrow
    throw e
  }
}

export function writeSummary(name: string, summary: Summary) {
  const outDir = path.join(process.cwd(), 'ops', 'out')
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(summary, null, 2))
}

export function slugify(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}


