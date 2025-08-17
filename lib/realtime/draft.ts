// lib/realtime/draft.ts
'use client';
import { Client, Realtime } from 'appwrite';

export function createDraftRealtime() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app');
  const rt = new Realtime(client);
  return rt;
}

export function subscribeToDraft(draftId: string, onEvent: (e: any) => void) {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app');

  const rt = new Realtime(client);
  const subs = [
    rt.subscribe([`databases.*.collections.mock_draft_picks.documents`], (e) => {
      if (e.events.some(ev => ev.includes('databases')) && e.payload?.draftId === draftId) {
        onEvent({ type: 'pick', data: e.payload });
      }
    }),
    rt.subscribe([`databases.*.collections.mock_drafts.documents`], (e) => {
      if (e.payload?.$id === draftId) {
        onEvent({ type: 'draft', data: e.payload });
      }
    }),
  ];
  return () => subs.forEach(s => s());
}

