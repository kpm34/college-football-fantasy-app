import { useState, useEffect, useCallback } from 'react';

interface UseRotowireOptions {
  player?: string;
  team?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface RotowireData<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastFetched: Date | null;
}

export function useRotowireNews(options: UseRotowireOptions = {}): RotowireData<any[]> {
  const { player, team, autoRefresh = false, refreshInterval = 3600000 } = options; // Default 1 hour
  
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (player) params.append('player', player);
      if (team) params.append('team', team);
      if (forceRefresh) params.append('refresh', 'true');
      
      const response = await fetch(`/api/rotowire/news?${params}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch news');
      }
      
      setData(result.data);
      setLastFetched(new Date());
    } catch (err: any) {
      setError(err.message);
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [player, team]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData(true);
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refresh, lastFetched };
}

export function useRotowireProjections(week: number): RotowireData<any[]> {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('week', week.toString());
      if (forceRefresh) params.append('refresh', 'true');
      
      const response = await fetch(`/api/rotowire/projections?${params}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch projections');
      }
      
      setData(result.data);
      setLastFetched(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [week]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refresh, lastFetched };
}
