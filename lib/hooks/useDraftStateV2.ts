import { client, COLLECTIONS, DATABASE_ID, databases } from '@/lib/appwrite'
import { RealtimeResponseEvent } from 'appwrite'
import { useCallback, useEffect, useState } from 'react'

export interface DraftStateSnapshot {
  _id: string
  phase: string
  onClockTeamId: string | null
  round: number
  pickIndex: number
  deadlineAt: string
  serverNow: string
}

interface UseDraftStateV2Return {
  state: DraftStateSnapshot | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  makePick: (args: { teamId: string; playerId: string }) => Promise<void>
}

export function useDraftStateV2(leagueId: string): UseDraftStateV2Return {
  const [state, setState] = useState<DraftStateSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Support either doc id == leagueId or a separate draftId field
  const directDocChannel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_STATES}.documents.${leagueId}`
  const collectionChannel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_STATES}.documents`

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFT_STATES, leagueId)
      setState(doc as unknown as DraftStateSnapshot)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [leagueId])

  useEffect(() => {
    if (!leagueId) return
    refresh()
    // Subscribe to both specific doc and collection filtered by draftId
    const unsubs: Array<() => void> = []
    try {
      unsubs.push(
        client.subscribe(directDocChannel, (evt: RealtimeResponseEvent<any>) => {
          if (evt.events.some(e => e.endsWith('.update') || e.endsWith('.create'))) {
            setState(evt.payload as DraftStateSnapshot)
          }
        })
      )
    } catch {}
    try {
      unsubs.push(
        client.subscribe(collectionChannel, (evt: RealtimeResponseEvent<any>) => {
          const payload = evt.payload as any
          if (!payload) return
          if (payload.$id === leagueId || String(payload.draftId) === String(leagueId)) {
            if (evt.events.some(e => e.endsWith('.update') || e.endsWith('.create'))) {
              setState(payload as DraftStateSnapshot)
            }
          }
        })
      )
    } catch {}
    return () => {
      unsubs.forEach(u => {
        try {
          u()
        } catch {}
      })
    }
  }, [leagueId, directDocChannel, collectionChannel, refresh])

  const makePick = useCallback(
    async ({ teamId, playerId }: { teamId: string; playerId: string }) => {
      const res = await fetch(`/api/drafts/${leagueId}/pick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ teamId, playerId }),
      })
      if (!res.ok) throw new Error(await res.text())
    },
    [leagueId]
  )

  return { state, loading, error, refresh, makePick }
}
