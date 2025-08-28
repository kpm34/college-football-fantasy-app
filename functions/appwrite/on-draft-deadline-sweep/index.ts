import { Client, Databases, Query } from 'node-appwrite'

export interface DraftStateDoc {
  $id: string
  draftId: string
  draftStatus?: string
  deadlineAt?: string
}

export async function main() {
  const endpoint = process.env.APPWRITE_ENDPOINT!
  const project = process.env.APPWRITE_PROJECT_ID!
  const apiKey = process.env.APPWRITE_API_KEY!
  const databaseId = process.env.APPWRITE_DATABASE_ID!
  const draftsStatesId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_STATES!
  const cronSecret = process.env.CRON_SECRET!

  const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey)
  const databases = new Databases(client)

  const nowIso = new Date().toISOString()

  const due = await databases.listDocuments(databaseId, draftsStatesId, [
    Query.equal('draftStatus', 'drafting'),
    Query.lessThanEqual('deadlineAt', nowIso),
    Query.limit(100)
  ])

  let triggered = 0
  for (const doc of due.documents as unknown as DraftStateDoc[]) {
    try {
      const lockKey = `draft:${doc.draftId}:deadline:${doc.deadlineAt}`
      // Lightweight distributed lock via Vercel KV (if available)
      try {
        const { kv } = await import('@vercel/kv')
        const ok = await kv.setnx(lockKey, '1')
        if (!ok) continue
        await kv.expire(lockKey, 5)
      } catch {}

      const base = process.env.NEXT_PUBLIC_BASE_URL?.trim() || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
      const resp = await fetch(`${base}/api/drafts/${doc.draftId}/autopick`, {
        method: 'POST',
        headers: { authorization: `Bearer ${cronSecret}` }
      })
      if (resp.ok) triggered += 1
    } catch {}
  }

  return { triggered }
}

export default main


