// AUTO-GENERATED. Do not edit by hand.
export type CollectionId = 'leagues' | 'user_teams' | 'college_players' | 'games' | 'rankings' | 'rosters' | 'lineups' | 'drafts' | 'draft_picks'

export interface LeaguesDoc {
  name: string
  commissioner: string
  season: number
  maxTeams: number
  draftType: 'snake' | 'auction'
  gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten' | 'conference'
  selectedConference?: string
  draftDate?: string
  status: 'open' | 'active' | 'complete' | 'drafting' | 'full'
}

export interface FantasyTeamsDoc {
  leagueId: string
  userId: string
  teamName: string
}

export interface CollegePlayersDoc {
  name: string
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K'
  team: string
  conference: string
  fantasy_points: number
  depth_chart_order?: number
  eligible: boolean
  draftable?: boolean
  year?: number
}

export interface GamesDoc {
  week: number
  season: number
  season_type: 'regular' | 'postseason'
  home_team: string
  away_team: string
  start_date: string
  status?: string
}

export interface RankingsDoc {
  week: number
  season: number
  poll: 'AP' | 'Coaches'
}

export interface RostersDoc {
  leagueId: string
  userId: string
  players?: any[]
}

export interface LineupsDoc {
  rosterId: string
  week: number
  season: number
  starters?: any[]
  bench?: any[]
}

export interface DraftsDoc {
  leagueId: string
  rounds: number
  order?: any[]
  status: 'scheduled' | 'live' | 'complete'
}

export interface DraftPicksDoc {
  leagueId: string
  userId: string
  playerId: string
  round: number
  pickNumber: number
  timestamp?: string
}
