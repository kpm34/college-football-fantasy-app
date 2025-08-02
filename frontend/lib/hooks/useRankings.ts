import { useState, useEffect } from 'react';
import { rankingsAPI } from '@/lib/api/rankings';
import { RankingsResponse, APRanking } from '@/types/rankings';
import { APIError } from '@/lib/api/client';

interface UseRankingsOptions {
  week?: number;
  autoRefresh?: boolean;
}

interface UseRankingsReturn {
  rankings: APRanking[];
  week: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRankings(options: UseRankingsOptions = {}): UseRankingsReturn {
  const { week, autoRefresh = false } = options;
  
  const [data, setData] = useState<RankingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = week 
        ? await rankingsAPI.getWeek(week)
        : await rankingsAPI.getCurrent();
        
      setData(response);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch rankings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();

    if (autoRefresh) {
      const interval = setInterval(fetchRankings, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [week, autoRefresh]);

  return {
    rankings: data?.polls[0]?.ranks || [],
    week: data?.week || null,
    loading,
    error,
    refetch: fetchRankings
  };
}