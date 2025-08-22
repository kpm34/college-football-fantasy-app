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

export interface GameWithEligibility extends Game {
  eligibilityReasons?: {
    home: string;
    away: string;
  };
}

export interface EligibleGamesResponse {
  total: number;
  eligible: number;
  games: GameWithEligibility[];
}