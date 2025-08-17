'use client'

import { useEffect, useState } from 'react'
import { client, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite'
import { type RealtimeResponseEvent } from 'appwrite'

export interface LeagueRealtimeState {
  league: any | null
  loading: boolean
  connected: boolean
  deleted: boolean
  error: string | null
}

export function useLeagueRealtime(leagueId: string, initialLeague?: any) {
  const [state, setState] = useState<LeagueRealtimeState>({
    league: initialLeague || null,
    loading: false,
    connected: false,
    deleted: false,
    error: null
  })

  // Real-time subscription for league updates/deletions
  useEffect(() => {
    if (!leagueId) return

    try {
      const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents`
      console.log('Subscribing to league realtime channel:', channel)
      
      const unsubscribe = client.subscribe(channel, (event: RealtimeResponseEvent<any>) => {
        setState(prev => ({ ...prev, connected: true, error: null }))
        
        const payload = event.payload as any
        
        // Only process events for our specific league
        if (!payload || payload.$id !== leagueId) return

        console.log('League realtime event:', event.events, payload)

        // Handle league updates
        if (event.events.some(e => e.endsWith('.update'))) {
          console.log('League updated:', payload)
          setState(prev => ({ 
            ...prev, 
            league: payload,
            deleted: false 
          }))
        }

        // Handle league deletion
        if (event.events.some(e => e.endsWith('.delete'))) {
          console.log('League deleted:', payload)
          setState(prev => ({ 
            ...prev, 
            deleted: true,
            league: null 
          }))
        }
      })

      // Set connected status
      setState(prev => ({ ...prev, connected: true }))

      return () => {
        console.log('Unsubscribing from league realtime')
        unsubscribe()
        setState(prev => ({ ...prev, connected: false }))
      }
    } catch (error) {
      console.error('Error subscribing to league realtime:', error)
      setState(prev => ({ 
        ...prev, 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
    }
  }, [leagueId])

  // Update league when initialLeague prop changes
  useEffect(() => {
    if (initialLeague) {
      setState(prev => ({ ...prev, league: initialLeague }))
    }
  }, [initialLeague])

  return state
}