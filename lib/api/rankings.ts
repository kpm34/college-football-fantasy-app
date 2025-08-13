import apiClient from './client';
import type { RankingsResponse, TeamRankingCheck } from '@/types/rankings';

export const rankingsAPI = {
  getCurrent: () => 
    apiClient.get<RankingsResponse>('/rankings'),

  getWeek: (week: number, year?: number) => {
    const params = year ? `?year=${year}` : '';
    return apiClient.get<RankingsResponse>(`/rankings/week/${week}${params}`);
  },

  checkTeam: (teamName: string) => 
    apiClient.get<TeamRankingCheck>(`/rankings/team/${encodeURIComponent(teamName)}`),
};