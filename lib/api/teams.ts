import apiClient from './client';
import type { Team, TeamPlayer, TeamsResponse } from '@lib/types/team';

export const teamsAPI = {
  getAll: () => 
    apiClient.get<TeamsResponse>('/teams'),

  getRoster: (teamId: string) => 
    apiClient.get<TeamPlayer[]>(`/teams/${fantasy_team_id}/roster`),
};