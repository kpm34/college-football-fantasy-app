export interface APRanking {
  rank: number;
  school: string;
  conference?: string;
  firstPlaceVotes?: number;
  points: number;
}

export interface RankingsPoll {
  poll: string;
  ranks: APRanking[];
}

export interface RankingsResponse {
  season: number;
  seasonType: string;
  week: number;
  polls: RankingsPoll[];
}

export interface TeamRankingCheck {
  team: string;
  isRanked: boolean;
  rank: number | null;
  points: number;
  firstPlaceVotes: number;
}