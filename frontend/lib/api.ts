// API configuration for College Football Fantasy App

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.origin
    ? `${window.location.origin}/api`
    : 'https://cfbfantasy.app/api');

// API helper functions
export const api = {
  // Fetch with error handling
  async fetch(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  // Game endpoints
  games: {
    getCurrent: () => api.fetch('/games'),
    getWeek: (week: number) => api.fetch(`/games/week/${week}`),
    getEligible: () => api.fetch('/games/eligible'),
    getDetails: (gameId: string) => api.fetch(`/games/${gameId}`),
  },

  // Rankings endpoints
  rankings: {
    getCurrent: () => api.fetch('/rankings'),
    getWeek: (week: number) => api.fetch(`/rankings/week/${week}`),
    checkTeam: (teamName: string) => api.fetch(`/rankings/team/${encodeURIComponent(teamName)}`),
  },

  // Teams endpoints
  teams: {
    getAll: () => api.fetch('/teams'),
    getRoster: (teamId: string) => api.fetch(`/teams/${teamId}/roster`),
  },

  // Eligibility endpoints
  eligibility: {
    check: (playerTeam: string, opponentTeam: string) => 
      api.fetch(`/eligibility/check?playerTeam=${playerTeam}&opponentTeam=${opponentTeam}`),
    getReport: () => api.fetch('/eligibility/report'),
    getTeamGames: (teamName: string) => 
      api.fetch(`/eligibility/team/${encodeURIComponent(teamName)}`),
  },
};

// Types (these match our backend)
export interface Game {
  id: string;
  season: number;
  week: number;
  seasonType: string;
  startDate: string;
  homeTeam: string;
  homeConference?: string;
  homePoints?: number;
  awayTeam: string;
  awayConference?: string;
  awayPoints?: number;
  status: 'scheduled' | 'in_progress' | 'final';
  period?: number;
  clock?: string;
}

export interface APRanking {
  rank: number;
  school: string;
  conference?: string;
  firstPlaceVotes?: number;
  points: number;
}

export interface Team {
  id: string;
  school: string;
  mascot?: string;
  abbreviation?: string;
  conference: string;
  conferenceId?: number;
  color?: string;
  altColor?: string;
  logo?: string;
}