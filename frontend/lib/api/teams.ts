import apiClient from './client';
import type { Team, Player, TeamsResponse } from '@/types/team';

export const teamsAPI = {
  getAll: () => 
    apiClient.get<TeamsResponse>('/teams'),

  getRoster: (teamId: string) => 
    apiClient.get<Player[]>(`/teams/${teamId}/roster`),
};