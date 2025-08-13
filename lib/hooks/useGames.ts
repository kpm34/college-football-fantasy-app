import { useState, useEffect } from 'react';
import { gamesAPI } from '@/lib/api/games';
import { Game, EligibleGamesResponse } from '@/types/game';
import { APIError } from '@/lib/api/client';

interface UseGamesOptions {
  week?: number;
  eligibleOnly?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGames(options: UseGamesOptions = {}): UseGamesReturn {
  const { 
    week, 
    eligibleOnly = false, 
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setError(null);
      
      if (eligibleOnly) {
        const response = await gamesAPI.getEligible();
        setGames(response.games);
      } else if (week) {
        const gamesData = await gamesAPI.getWeek(week);
        setGames(gamesData);
      } else {
        const gamesData = await gamesAPI.getCurrent();
        setGames(gamesData);
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchGames, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [week, eligibleOnly, autoRefresh, refreshInterval]);

  return {
    games,
    loading,
    error,
    refetch: fetchGames
  };
}