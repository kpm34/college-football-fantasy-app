import apiClient from './client';
import type { Game, GameWithEligibility, EligibleGamesResponse } from '@lib/types/game';

export const gamesAPI = {
  getCurrent: () => 
    apiClient.get<Game[]>('/games'),

  getWeek: (week: number, year?: number) => {
    const params = year ? `?year=${year}` : '';
    return apiClient.get<Game[]>(`/games/week/${week}${params}`);
  },

  getEligible: () => 
    apiClient.get<EligibleGamesResponse>('/games/eligible'),

  getDetails: (gameId: string) => 
    apiClient.get<Game>(`/games/${gameId}`),
};