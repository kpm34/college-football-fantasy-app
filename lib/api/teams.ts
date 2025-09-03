import type { TeamPlayer, TeamsResponse } from '@lib/types/team'
import apiClient from './client'

export const teamsAPI = {
  getAll: () => apiClient.get<TeamsResponse>('/teams'),

  getRoster: (teamId: string) => apiClient.get<TeamPlayer[]>(`/teams/${teamId}/roster`),
}
