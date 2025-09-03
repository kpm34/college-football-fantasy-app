'use client'

import DraftCore from '@/components/features/draft/DraftCore'
import { useDraftRealtime } from '@/lib/hooks/useDraftRealtime'
import { useDraftStateV2 } from '@/lib/hooks/useDraftStateV2'
import { useEffect, useState } from 'react'

interface Props {
  params: { leagueId: string }
}

export default function DraftRoomPage({ params }: Props) {
  const { leagueId } = params
  const [engineVersion, setEngineVersion] = useState<'v1' | 'v2' | null>(null)
  const [leagueNotFound, setNotFound] = useState(false)

  // Fetch league meta once to know engine version
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/leagues/${leagueId}`, { cache: 'no-store' })
        if (!res.ok) {
          setNotFound(true)
          return
        }
        const json = await res.json()
        const league = json?.league || json?.data || null
        const engine =
          (league?.engineVersion as 'v1' | 'v2' | undefined) ||
          (league?.draftEngine as 'v1' | 'v2' | undefined) ||
          'v2' // default to v2 engine
        setEngineVersion(engine)
      } catch {
        setEngineVersion('v2')
      }
    }
    load()
  }, [leagueId])

  if (leagueNotFound) {
    return <div className="p-8 text-center">League not found.</div>
  }

  if (!engineVersion) {
    return <div className="p-4">Loading draft room...</div>
  }

  if (engineVersion === 'v2') {
    const { state, loading, makePick } = useDraftStateV2(leagueId)
    // Basic UI placeholder
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Draft Room (v2)</h1>
        {loading || !state ? (
          <p>Loading state…</p>
        ) : (
          <div>
            <p>
              Round {state.round} – Pick {state.pickIndex}
            </p>
            <p>On the clock: {state.onClockTeamId}</p>
            <p>Deadline: {new Date(state.deadlineAt).toLocaleTimeString()}</p>
          </div>
        )}
        {/* DraftCore component here if you want full UI */}
        {/* Example button to test pick */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() =>
            makePick({ teamId: state?.onClockTeamId || '', playerId: prompt('Player ID') || '' })
          }
        >
          Draft Player
        </button>
      </div>
    )
  }

  // Fallback to legacy realtime hook/UI
  const draft = useDraftRealtime(leagueId)
  return (
    <DraftCore
      leagueId={leagueId}
      draftType="snake"
      canDraft={draft.isMyTurn}
      timeRemainingSec={
        draft.deadlineAt ? (new Date(draft.deadlineAt).getTime() - Date.now()) / 1000 : undefined
      }
    />
  )
}
