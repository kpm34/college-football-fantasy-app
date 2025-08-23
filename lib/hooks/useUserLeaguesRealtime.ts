'use client'

import { useEffect, useState } from 'react'
import { client, DATABASE_ID, COLLECTIONS } from '@lib/appwrite'
import { type RealtimeResponseEvent } from 'appwrite'
import { useAuth } from '@lib/hooks/useAuth'

export interface UserLeague {
  $id: string
  name: string
  status: string
  commissioner: string
  maxTeams: number
  currentTeams: number
  draftDate?: string
  gameMode?: string
}

export interface UserLeaguesRealtimeState {
  leagues: UserLeague[]
  loading: boolean
  connected: boolean
  error: string | null
}

export function useUserLeaguesRealtime() {
  const { user } = useAuth()
  const [state, setState] = useState<UserLeaguesRealtimeState>({
    leagues: [],
    loading: true,
    connected: false,
    error: null
  })

  // Initial load of user leagues
  useEffect(() => {
    if (!user?.$id) return

    const loadUserLeagues = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }))
        
        const response = await fetch('/api/leagues/my-leagues')
        if (!response.ok) throw new Error('Failed to load leagues')
        
        const data = await response.json()
        setState(prev => ({ 
          ...prev, 
          leagues: data.leagues || [],
          loading: false 
        }))
      } catch (error) {
        console.error('Error loading user leagues:', error)
        setState(prev => ({ 
          ...prev, 
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load leagues'
        }))
      }
    }

    loadUserLeagues()
  }, [user?.$id])

  // Real-time subscription for league changes
  useEffect(() => {
    if (!user?.$id) return

    try {
      // Subscribe to league changes
      const leaguesChannel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`
      const rostersChannel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.FANTASY_TEAMS}.documents`
      
      console.log('Subscribing to user leagues realtime channels')
      
      const unsubscribeLeagues = client.subscribe(leaguesChannel, (event: RealtimeResponseEvent<any>) => {
        setState(prev => ({ ...prev, connected: true }))
        
        const payload = event.payload as any
        if (!payload) return

        console.log('League realtime event:', event.events, payload.$id)

        // Handle league updates
        if (event.events.some(e => e.endsWith('.update'))) {
          setState(prev => ({
            ...prev,
            leagues: prev.leagues.map(league => 
              league.$id === payload.$id ? { ...league, ...payload } : league
            )
          }))
        }

        // Handle league deletion
        if (event.events.some(e => e.endsWith('.delete'))) {
          console.log('League deleted from user view:', payload.$id)
          setState(prev => ({
            ...prev,
            leagues: prev.leagues.filter(league => league.$id !== payload.$id)
          }))
        }
      })

      // Subscribe to roster changes (for when user gets kicked from league)
      const unsubscribeRosters = client.subscribe(rostersChannel, (event: RealtimeResponseEvent<any>) => {
        const payload = event.payload as any
        if (!payload || payload.client_id !== user.$id) return

        console.log('User roster event:', event.events, payload.leagueId)

        // Handle roster deletion (user removed from league)
        if (event.events.some(e => e.endsWith('.delete'))) {
          console.log('User removed from league:', payload.leagueId)
          setState(prev => ({
            ...prev,
            leagues: prev.leagues.filter(league => league.$id !== payload.leagueId)
          }))
        }
      })

      return () => {
        console.log('Unsubscribing from user leagues realtime')
        unsubscribeLeagues()
        unsubscribeRosters()
        setState(prev => ({ ...prev, connected: false }))
      }
    } catch (error) {
      console.error('Error subscribing to user leagues realtime:', error)
      setState(prev => ({ 
        ...prev, 
        connected: false,
        error: error instanceof Error ? error.message : 'Connection error'
      }))
    }
  }, [user?.$id])

  return state
}