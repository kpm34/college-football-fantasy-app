import { useState, useEffect } from 'react';
import { teamsAPI } from '@lib/api/teams';
import { Team, TeamsResponse } from '@lib/types/team';
import { APIError } from '@lib/api/client';

interface UseTeamsReturn {
  teams: Record<string, Team[]>;
  conferences: string[];
  totalTeams: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTeams(): UseTeamsReturn {
  const [data, setData] = useState<TeamsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamsAPI.getAll();
      setData(response);
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to fetch teams');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return {
    teams: data?.teams || {},
    conferences: data?.conferences || [],
    totalTeams: data?.total || 0,
    loading,
    error,
    refetch: fetchTeams
  };
}