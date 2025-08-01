export interface Conference {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Team {
  id: string;
  school: string;
  mascot?: string;
  abbreviation?: string;
  conference?: string;
  conferenceId?: number;
  color?: string;
  altColor?: string;
  logo?: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jersey?: string;
  position: {
    id: string;
    name: string;
    displayName: string;
    abbreviation: string;
  };
  team: string;
  teamId: string;
  conference?: string;
  eligibleForWeek?: boolean;
}

export interface APRanking {
  rank: number;
  school: string;
  conference?: string;
  firstPlaceVotes?: number;
  points: number;
}

export interface APPoll {
  season: number;
  seasonType: string;
  week: number;
  polls: Array<{
    poll: string;
    ranks: APRanking[];
  }>;
}

export interface Game {
  id: string;
  season: number;
  week: number;
  seasonType: string;
  startDate: string;
  startTimeTBD?: boolean;
  homeTeam: string;
  homeConference?: string;
  homePoints?: number;
  awayTeam: string;
  awayConference?: string;
  awayPoints?: number;
  status: GameStatus;
  period?: number;
  clock?: string;
}

export enum GameStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  FINAL = 'final',
  POSTPONED = 'postponed',
  CANCELED = 'canceled'
}

export interface PlayerStats {
  playerId: string;
  player: string;
  team: string;
  conference: string;
  category: 'passing' | 'rushing' | 'receiving' | 'defense' | 'kicking';
  games: number;
  stats: {
    [key: string]: number;
  };
}

export interface ESPNScoreboardResponse {
  events: ESPNEvent[];
  week: {
    number: number;
  };
  season: {
    year: number;
    type: number;
  };
}

export interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  status: {
    clock: number;
    displayClock: string;
    period: number;
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
    };
  };
  competitions: ESPNCompetition[];
}

export interface ESPNCompetition {
  id: string;
  date: string;
  competitors: ESPNCompetitor[];
  conferenceCompetition: boolean;
  playByPlayAvailable: boolean;
}

export interface ESPNCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  team: {
    id: string;
    location: string;
    name: string;
    abbreviation: string;
    displayName: string;
    shortDisplayName: string;
    color: string;
    alternateColor: string;
    logo: string;
    conferenceId?: string;
  };
  score: string;
  curatedRank?: {
    current: number;
  };
  statistics: any[];
}

export interface ESPNTeamRoster {
  athletes: ESPNAthlete[];
}

export interface ESPNAthlete {
  id: string;
  uid: string;
  guid: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jersey?: string;
  position: {
    id: string;
    name: string;
    displayName: string;
    abbreviation: string;
  };
}

export interface CFBDGame {
  id: number;
  season: number;
  week: number;
  season_type: string;
  start_date: string;
  home_team: string;
  home_conference?: string;
  home_points?: number;
  home_line_scores?: number[];
  away_team: string;
  away_conference?: string;
  away_points?: number;
  away_line_scores?: number[];
  conference_game?: boolean;
}

export interface CFBDRanking {
  season: number;
  seasonType: string;
  week: number;
  polls: Array<{
    poll: string;
    ranks: Array<{
      rank: number;
      school: string;
      conference?: string;
      firstPlaceVotes?: number;
      points: number;
    }>;
  }>;
}

export interface CFBDPlayerStats {
  playerId: number;
  player: string;
  team: string;
  conference: string;
  category: string;
  statType: string;
  stat: number;
}

export interface FantasyPlayer extends Player {
  fantasyPoints: number;
  weeklyProjection?: number;
  seasonTotal: number;
  eligibleGames: Game[];
}