export interface PlayerProjection {
  $id: string;
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  conference: string;
  school: string;
  year: string;
  
  // Previous year stats from ESPN
  prevYearStats: {
    gamesPlayed: number;
    passingYards?: number;
    passingTDs?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTDs?: number;
    receivingYards?: number;
    receivingTDs?: number;
    receptions?: number;
    fantasyPoints: number;
  };
  
  // Ratings and rankings
  ratings: {
    ncaaRating?: number;
    spPlusRating?: number;
    pffGrade?: number;
    composite: number;
  };
  
  // Projections
  projections: {
    gamesPlayed: number;
    passingYards?: number;
    passingTDs?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTDs?: number;
    receivingYards?: number;
    receivingTDs?: number;
    receptions?: number;
    fantasyPoints: number;
    confidence: number; // 0-100 confidence score
  };
  
  // Rankings
  rankings: {
    overall: number;
    position: number;
    adp: number; // Average Draft Position
    tier: number;
  };
  
  // Meta data for projection sources
  sources: {
    espn: boolean;
    ncaa: boolean;
    spPlus: boolean;
    mockDrafts: string[];
    socialMediaBuzz: number; // 0-100 buzz score
    articles: string[];
  };
  
  // Injury and risk factors
  risk: {
    injuryHistory: string[];
    suspensions: string[];
    riskScore: number; // 0-100, higher is riskier
  };
  
  updatedAt: string;
}

export interface DraftPlayer extends PlayerProjection {
  isDrafted: boolean;
  draftedBy?: string;
  draftPosition?: number;
  draftRound?: number;
}
