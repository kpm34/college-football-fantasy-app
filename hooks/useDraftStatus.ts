"use client";

import { useEffect, useState } from 'react';
import { client, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';

interface DraftStatus {
  isDraftTime: boolean;
  isDraftActive: boolean;
  isDraftComplete: boolean;
  timeUntilDraft: string;
  draftDate?: Date;
  status: string;
}

export function useDraftStatus(leagueId: string) {
  const [draftStatus, setDraftStatus] = useState<DraftStatus>({
    isDraftTime: false,
    isDraftActive: false,
    isDraftComplete: false,
    timeUntilDraft: '',
    status: 'open'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leagueId) return;

    let unsubscribe: (() => void) | undefined;

    const subscribeToLeague = async () => {
      try {
        // Subscribe to league document changes for real-time status updates
        unsubscribe = client.subscribe(
          `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents.${leagueId}`,
          (response) => {
            console.log('Draft status update received:', response);
            
            if (response.events.includes('databases.*.collections.*.documents.*.update')) {
              const league = response.payload;
              updateDraftStatus(league);
            }
          }
        );

        // Get initial league data
        const { databases } = await import('@/lib/appwrite');
        const league = await databases.getDocument(DATABASE_ID, COLLECTIONS.LEAGUES, leagueId);
        updateDraftStatus(league);
        setLoading(false);
        
      } catch (error) {
        console.error('Error subscribing to draft status:', error);
        setLoading(false);
      }
    };

    const updateDraftStatus = (league: any) => {
      if (!league.draftDate) {
        setDraftStatus({
          isDraftTime: false,
          isDraftActive: false,
          isDraftComplete: false,
          timeUntilDraft: '',
          status: league.status || 'open'
        });
        return;
      }

      const now = new Date();
      const draftDate = new Date(league.draftDate);
      const timeDiff = draftDate.getTime() - now.getTime();
      
      // Draft is complete if status is active or complete
      if (league.status === 'active' || league.status === 'complete') {
        setDraftStatus({
          isDraftTime: false,
          isDraftActive: false,
          isDraftComplete: true,
          timeUntilDraft: 'Complete',
          draftDate,
          status: league.status
        });
        return;
      }
      
      // Draft is currently active if status is 'drafting'
      if (league.status === 'drafting') {
        setDraftStatus({
          isDraftTime: true,
          isDraftActive: true,
          isDraftComplete: false,
          timeUntilDraft: 'Active',
          draftDate,
          status: league.status
        });
        return;
      }
      
      // Check if we're within the draft window (15 minutes before to 3 hours after)
      const draftWindow = {
        start: draftDate.getTime() - (15 * 60 * 1000), // 15 minutes before
        end: draftDate.getTime() + (3 * 60 * 60 * 1000) // 3 hours after
      };
      
      const isInDraftWindow = now.getTime() >= draftWindow.start && now.getTime() <= draftWindow.end;
      
      // Calculate time until draft
      let timeUntilDraft = '';
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          timeUntilDraft = `${days}d ${hours}h`;
        } else if (hours > 0) {
          timeUntilDraft = `${hours}h ${minutes}m`;
        } else {
          timeUntilDraft = `${minutes}m`;
        }
      } else if (isInDraftWindow) {
        timeUntilDraft = 'Draft time!';
      } else {
        timeUntilDraft = 'Draft window closed';
      }

      setDraftStatus({
        isDraftTime: isInDraftWindow,
        isDraftActive: false,
        isDraftComplete: false,
        timeUntilDraft,
        draftDate,
        status: league.status
      });
    };

    subscribeToLeague();

    // Update status every minute
    const interval = setInterval(() => {
      if (draftStatus.draftDate) {
        const mockLeague = {
          draftDate: draftStatus.draftDate.toISOString(),
          status: draftStatus.status
        };
        updateDraftStatus(mockLeague);
      }
    }, 60000);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      clearInterval(interval);
    };
  }, [leagueId]);

  return { draftStatus, loading };
}