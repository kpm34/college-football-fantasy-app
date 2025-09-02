"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiClock, FiPlay, FiCheckCircle } from 'react-icons/fi';
import { client, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { type RealtimeResponseEvent } from 'appwrite';

interface League {
  $id: string;
  status: string;
  draftDate?: string;
  draftStartedAt?: string;
}

interface DraftButtonProps {
  league: League;
  isCommissioner: boolean;
  isMember: boolean;
}

export function DraftButton({ league, isCommissioner, isMember }: DraftButtonProps) {
  const router = useRouter();
  const [timeUntilDraft, setTimeUntilDraft] = useState<string>('');
  const [isDraftTime, setIsDraftTime] = useState(false);
  const [isDraftActive, setIsDraftActive] = useState(false);
  const [isDraftComplete, setIsDraftComplete] = useState(false);
  const [currentLeague, setCurrentLeague] = useState<League>(league);

  // Subscribe to real-time updates for this league
  useEffect(() => {
    if (!league.$id) return;

    try {
      const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.LEAGUES}.documents.${league.$id}`;
      console.log('[DraftButton] Subscribing to league updates:', channel);
      
      const unsubscribe = client.subscribe(channel, (event: RealtimeResponseEvent<any>) => {
        const payload = event.payload as any;
        
        // Handle league updates
        if (event.events.some(e => e.endsWith('.update'))) {
          console.log('[DraftButton] League updated, new draft date:', payload.draftDate);
          setCurrentLeague(payload);
        }
      });

      return () => {
        console.log('[DraftButton] Unsubscribing from league updates');
        unsubscribe();
      };
    } catch (error) {
      console.error('[DraftButton] Error subscribing to league updates:', error);
    }
  }, [league.$id]);

  // Update current league when prop changes
  useEffect(() => {
    setCurrentLeague(league);
  }, [league]);

  useEffect(() => {
    if (!currentLeague.draftDate) {
      setTimeUntilDraft('');
      setIsDraftTime(false);
      setIsDraftActive(false);
      setIsDraftComplete(false);
      return;
    }

    const updateDraftStatus = () => {
      const now = new Date();
      const draftDate = new Date(currentLeague.draftDate!);
      const timeDiff = draftDate.getTime() - now.getTime();
      
      // Draft is complete if status is active or complete
      if (currentLeague.status === 'active' || currentLeague.status === 'complete') {
        setIsDraftComplete(true);
        setIsDraftActive(false);
        setIsDraftTime(false);
        setTimeUntilDraft('');
        return;
      }
      
      // Draft is currently active if status is 'drafting'
      if (currentLeague.status === 'drafting') {
        setIsDraftActive(true);
        setIsDraftTime(true);
        setIsDraftComplete(false);
        setTimeUntilDraft('In Progress');
        return;
      }
      
      // Check if we're within the draft window (1 hour before to 3 hours after)
      const draftWindow = {
        start: draftDate.getTime() - (60 * 60 * 1000), // 1 hour before
        end: draftDate.getTime() + (3 * 60 * 60 * 1000) // 3 hours after
      };
      
      const isInDraftWindow = now.getTime() >= draftWindow.start && now.getTime() <= draftWindow.end;
      setIsDraftTime(isInDraftWindow);
      setIsDraftActive(false);
      setIsDraftComplete(false);
      
      // Calculate time until draft with seconds for more precise countdown
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        if (days > 0) {
          setTimeUntilDraft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeUntilDraft(`${hours}h ${minutes}m`);
        } else if (minutes > 0) {
          setTimeUntilDraft(`${minutes}m ${seconds}s`);
        } else {
          setTimeUntilDraft(`${seconds}s`);
        }
      } else if (isInDraftWindow) {
        setTimeUntilDraft('Draft time!');
      } else {
        setTimeUntilDraft('Draft window closed');
      }
    };

    // Initial update
    updateDraftStatus();
    
    // Update more frequently based on time remaining
    const now = new Date();
    const draftDate = new Date(currentLeague.draftDate);
    const timeDiff = draftDate.getTime() - now.getTime();
    
    // Update every second if less than 5 minutes away, otherwise every 30 seconds
    const updateInterval = timeDiff > 0 && timeDiff < 5 * 60 * 1000 ? 1000 : 30000;
    const interval = setInterval(updateDraftStatus, updateInterval);
    
    return () => clearInterval(interval);
  }, [currentLeague.draftDate, currentLeague.status]);

  const handleDraftClick = () => {
    const id = (league as any).$id || (league as any).id;
    if (!id) return;
    router.push(`/draft/${id}`);
  };

  // Don't show button if user is not a member
  if (!isMember) {
    return null;
  }

  // Draft completed
  if (isDraftComplete) {
    return (
      <div className="p-4 rounded-xl flex items-center justify-center gap-3 bg-gray-600 text-gray-300">
        <FiCheckCircle className="text-xl" />
        <span className="font-semibold">Draft Complete</span>
      </div>
    );
  }

  // Draft is currently active - show to all members
  if (isDraftActive) {
    return (
      <button
        onClick={handleDraftClick}
        className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg animate-pulse bg-green-600 hover:bg-green-700 text-white"
      >
        <FiPlay className="text-xl" />
        <div className="flex flex-col items-start">
          <span className="font-semibold">DRAFT ROOM</span>
          <span className="text-xs opacity-90">Draft in progress</span>
        </div>
      </button>
    );
  }

  // Draft time window is open - show to all members
  if (isDraftTime) {
    return (
      <button
        onClick={handleDraftClick}
        className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg animate-pulse bg-orange-600 hover:bg-orange-700 text-white"
      >
        <FiPlay className="text-xl" />
        <div className="flex flex-col items-start">
          <span className="font-semibold">DRAFT ROOM</span>
          <span className="text-xs opacity-90">{timeUntilDraft}</span>
        </div>
      </button>
    );
  }

  // Commissioner can always start the draft if it's scheduled
  if (isCommissioner && currentLeague.draftDate) {
    return (
      <button
        onClick={handleDraftClick}
        className="p-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
      >
        <FiClock className="text-xl" />
        <div className="flex flex-col items-start">
          <span className="font-semibold">DRAFT ROOM</span>
          <span className="text-xs opacity-90">{timeUntilDraft}</span>
        </div>
      </button>
    );
  }

  // Show countdown for members when draft is scheduled but not yet time
  if (currentLeague.draftDate && timeUntilDraft) {
    return (
      <div className="p-4 rounded-xl flex items-center justify-center gap-3 bg-gray-700 text-gray-300">
        <FiClock className="text-xl" />
        <div className="flex flex-col items-start">
          <span className="font-semibold">Draft Scheduled</span>
          <span className="text-xs opacity-90">{timeUntilDraft}</span>
        </div>
      </div>
    );
  }

  // No draft date set
  return null;
}