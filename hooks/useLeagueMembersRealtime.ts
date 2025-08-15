'use client'

import { useEffect, useMemo, useState } from 'react'
import { client, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { Query, type RealtimeResponseEvent } from 'appwrite'

export interface LeagueTeam {
  $id: string
  leagueId: string
  userId: string
  name: string
  userName?: string
  email?: string
  wins: number
  losses: number
  ties?: number
  points?: number
  pointsFor?: number
  pointsAgainst?: number
  players?: string
  isActive?: boolean
  status?: string
}

function mapRosterToTeam(doc: any): LeagueTeam {
  return {
    $id: doc.$id,
    leagueId: doc.leagueId,
    userId: doc.userId || doc.owner || '',
    name: doc.teamName || doc.name || 'Team',
    userName: doc.userName,
    email: doc.email,
    wins: doc.wins ?? 0,
    losses: doc.losses ?? 0,
    ties: doc.ties ?? 0,
    points: doc.points ?? doc.pointsFor ?? 0,
    pointsFor: doc.pointsFor ?? doc.points ?? 0,
    pointsAgainst: doc.pointsAgainst ?? 0,
    players: doc.players,
    isActive: doc.isActive ?? (doc.status ? String(doc.status).toLowerCase() === 'active' : true),
    status: doc.status,
  }
}

export function useLeagueMembersRealtime(leagueId: string) {
  const [teams, setTeams] = useState<LeagueTeam[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [connected, setConnected] = useState<boolean>(false)

  // Initial load via API route
  useEffect(() => {
    let cancelled = false
    if (!leagueId) return

    ;(async () => {
      try {
        setLoading(true)
        console.log('Fetching rosters for league:', leagueId)
        
        // Use API route instead of direct database access
        const response = await fetch(`/api/leagues/${leagueId}/members`);
        const data = await response.json();
        
        if (data.success && !cancelled) {
          console.log('Fetched rosters:', data.teams.length)
          setTeams(data.teams)
        } else if (!data.success) {
          console.error('Failed to fetch rosters:', data.error)
        }
      } catch (error) {
        console.error('Error fetching rosters:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [leagueId])

  // Realtime subscription
  useEffect(() => {
    if (!leagueId) return

    try {
      const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.ROSTERS}.documents`
      console.log('Subscribing to channel:', channel)
      const unsubscribe = client.subscribe(channel, (event: RealtimeResponseEvent<any>) => {
        setConnected(true)
        const payload = event.payload as any
        if (!payload || payload.leagueId !== leagueId) return

        // Handle create/update/delete
        if (event.events.some(e => e.endsWith('.create'))) {
          setTeams(prev => {
            const exists = prev.some(t => t.$id === payload.$id)
            const next = exists ? prev : [...prev, mapRosterToTeam(payload)]
            return next
          })
        }
        if (event.events.some(e => e.endsWith('.update'))) {
          setTeams(prev => prev.map(t => (t.$id === payload.$id ? mapRosterToTeam(payload) : t)))
        }
        if (event.events.some(e => e.endsWith('.delete'))) {
          setTeams(prev => prev.filter(t => t.$id !== payload.$id))
        }
      })

      return () => unsubscribe()
    } catch (error) {
      console.error('Error subscribing to realtime:', error)
      setConnected(false)
    }
  }, [leagueId])

  const count = useMemo(() => teams.length, [teams])
  const activeCount = useMemo(() => teams.filter(t => t.isActive !== false && (t.status ? t.status.toLowerCase() !== 'inactive' : true)).length, [teams])

  return { teams, count, activeCount, loading, connected }
}


