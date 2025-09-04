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
    return (
      <div className="min-h-screen bg-white text-gray-900 p-8 text-center">League not found.</div>
    )
  }

  // Always call hooks in a fixed order; decide which data to show after
  const v2 = useDraftStateV2(leagueId)
  const legacy = useDraftRealtime(leagueId)

  if (!engineVersion) {
    return <div className="min-h-screen bg-white text-gray-900 p-4">Loading draft room...</div>
  }

  const showV2 = engineVersion === 'v2'
  const round = showV2 ? v2.state?.round : legacy.currentRound
  const pickIndex = showV2 ? v2.state?.pickIndex : legacy.currentPick
  const onClock = showV2 ? v2.state?.onClockTeamId : legacy.onTheClock
  const deadline = showV2 ? v2.state?.deadlineAt : legacy.deadlineAt
  const loading = showV2 ? v2.loading : legacy.loading
  const error = showV2 ? v2.error : legacy.error

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Draft Room ({showV2 ? 'v2' : 'legacy'})</h1>
        {loading && <p>Loading state…</p>}
        {!loading && error && (
          <div className="rounded border border-yellow-400 bg-yellow-50 text-yellow-800 p-3">
            {error.includes('not started') || error.includes('404')
              ? 'Draft has not started yet. The commissioner can start the draft from league settings.'
              : `Error: ${error}`}
          </div>
        )}
        {!loading && (round || pickIndex) && (
          <div>
            <p>
              Round {round} – Pick {pickIndex}
            </p>
            <p>On the clock: {onClock}</p>
            {deadline && <p>Deadline: {new Date(deadline).toLocaleTimeString()}</p>}
          </div>
        )}

        <DraftCore
          leagueId={leagueId}
          draftType="snake"
          canDraft={showV2 ? false : legacy.isMyTurn}
          timeRemainingSec={
            deadline ? (new Date(deadline).getTime() - Date.now()) / 1000 : undefined
          }
        />
      </div>
    </div>
  )
}
