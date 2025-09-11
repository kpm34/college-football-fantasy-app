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
  const [initial, setInitial] = useState<{
    picks: any[]
    teams: { $id: string; teamName: string; ownerAuthUserId: string }[]
    state: any | null
  } | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  // Always call hooks in a fixed order at the top
  const v2 = useDraftStateV2(leagueId)
  const legacy = useDraftRealtime(leagueId)

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
        // Load consolidated draft data (picks/teams/state)
        const dataRes = await fetch(`/api/drafts/${leagueId}/data`, { cache: 'no-store' })
        if (dataRes.ok) {
          const dj = await dataRes.json()
          setInitial({
            picks: dj?.data?.picks?.items || [],
            teams: dj?.data?.teams || [],
            state: dj?.data?.state || null,
          })
        }
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

  // Determine my team id from initial teams once available
  const sessionUserId = (typeof window !== 'undefined' && (window as any).__authUserId) || null
  const myTeamId = (initial?.teams || []).find(
    t => String(t.ownerAuthUserId) === String(sessionUserId)
  )?.$id

  const showV2 = engineVersion === 'v2'
  const round = showV2 ? (v2.state?.round ?? initial?.state?.round) : legacy.currentRound
  const pickIndex = showV2 ? (v2.state?.pickIndex ?? initial?.state?.pickIndex) : legacy.currentPick
  const onClock = showV2
    ? (v2.state?.onClockTeamId ?? initial?.state?.onClockTeamId)
    : legacy.onTheClock
  const deadline = showV2 ? (v2.state?.deadlineAt ?? initial?.state?.deadlineAt) : legacy.deadlineAt
  const loading = showV2 ? v2.loading && !initial : legacy.loading
  const error = showV2 ? v2.error : legacy.error

  const canDraft = showV2
    ? v2.state?.onClockTeamId === myTeamId && (v2.state as any)?.draftStatus === 'drafting'
    : legacy.isMyTurn

  if (!engineVersion) {
    return <div className="min-h-screen bg-white text-gray-900 p-4">Loading draft room...</div>
  }
  const handleDraft = async (player: any) => {
    if (!showV2) return
    if (!myTeamId || !player?.id) return
    try {
      setSubmitting(true)
      const idem =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`
      await fetch(`/api/drafts/${leagueId}/pick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idem },
        body: JSON.stringify({ teamId: myTeamId, playerId: player.id }),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen ui-surface">
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-bold">Draft Room ({showV2 ? 'v2' : 'legacy'})</h1>
        {loading && <p>Loading state…</p>}
        {!loading && error && (
          <div className="ui-panel-3d text-yellow-800 p-3">
            {error.includes('not started') || error.includes('404')
              ? 'Draft has not started yet. The commissioner can start the draft from league settings.'
              : `Error: ${error}`}
          </div>
        )}
        {!loading && (round || pickIndex) && (
          <div className="ui-panel-3d p-3">
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
          canDraft={canDraft && !isSubmitting}
          timeRemainingSec={
            deadline ? (new Date(deadline).getTime() - Date.now()) / 1000 : undefined
          }
          draftedPlayers={initial?.picks || []}
          onPlayerDraft={player => handleDraft(player)}
        />
      </div>
    </div>
  )
}
