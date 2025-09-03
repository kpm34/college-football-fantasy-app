// lib/realtime/draft.ts
'use client'
import { Client } from 'appwrite'

export function createDraftRealtime() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')

  return client
}

export function subscribeToDraft(draftId: string, onEvent: (e: any) => void) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')

  // Use client.subscribe method directly (Appwrite v16+ pattern)
  const subs = [
    client.subscribe([`databases.*.collections.mock_draft_picks.documents`], e => {
      if (
        e.events.some(ev => ev.includes('databases')) &&
        (e.payload as any)?.draftId === draftId
      ) {
        onEvent({ type: 'pick', data: e.payload })
      }
    }),
    client.subscribe([`databases.*.collections.mock_drafts.documents`], e => {
      if ((e.payload as any)?.$id === draftId) {
        onEvent({ type: 'draft', data: e.payload })
      }
    }),
  ]
  return () => subs.forEach(s => s())
}
