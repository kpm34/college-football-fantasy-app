// Machine-readable COLLECTIONS registry for guards and generators
// IMPORTANT: Keep IDs in sync with Appwrite collections

export type AttributeKind = 'string' | 'number' | 'boolean' | 'datetime' | 'enum' | 'array' | 'object';

export interface AttributeDef {
  type: AttributeKind;
  required: boolean;
  enumValues?: string[];
}

export interface CollectionDef {
  id: string;
  attributes: Record<string, AttributeDef>;
}

export const COLLECTIONS: Record<string, CollectionDef> = {
  leagues: {
    id: 'leagues',
    attributes: {
      name: { type: 'string', required: true },
      commissioner: { type: 'string', required: true },
      season: { type: 'number', required: true },
      maxTeams: { type: 'number', required: true },
      draftType: { type: 'enum', required: true, enumValues: ['snake','auction'] },
      gameMode: { type: 'enum', required: true, enumValues: ['power4','sec','acc','big12','bigten','conference'] },
      selectedConference: { type: 'string', required: false },
      draftDate: { type: 'datetime', required: false },
      status: { type: 'enum', required: true, enumValues: ['open','active','complete','drafting','full'] },
    }
  },
  fantasy_teams: {
    id: 'user_teams',
    attributes: {
      leagueId: { type: 'string', required: true },
      userId: { type: 'string', required: true },
      teamName: { type: 'string', required: true },
    }
  },
  college_players: {
    id: 'college_players',
    attributes: {
      name: { type: 'string', required: true },
      position: { type: 'enum', required: true, enumValues: ['QB','RB','WR','TE','K'] },
      team: { type: 'string', required: true },
      conference: { type: 'string', required: true },
      fantasy_points: { type: 'number', required: true },
      depth_chart_order: { type: 'number', required: false },
      eligible: { type: 'boolean', required: true },
      draftable: { type: 'boolean', required: false },
      year: { type: 'number', required: false },
    }
  },
  games: {
    id: 'games',
    attributes: {
      week: { type: 'number', required: true },
      season: { type: 'number', required: true },
      season_type: { type: 'enum', required: true, enumValues: ['regular','postseason'] },
      home_team: { type: 'string', required: true },
      away_team: { type: 'string', required: true },
      start_date: { type: 'datetime', required: true },
      status: { type: 'string', required: false },
    }
  },
  rankings: {
    id: 'rankings',
    attributes: {
      week: { type: 'number', required: true },
      season: { type: 'number', required: true },
      poll: { type: 'enum', required: true, enumValues: ['AP','Coaches'] },
    }
  },
  rosters: {
    id: 'rosters',
    attributes: {
      leagueId: { type: 'string', required: true },
      userId: { type: 'string', required: true },
      players: { type: 'array', required: false },
    }
  },
  lineups: {
    id: 'lineups',
    attributes: {
      rosterId: { type: 'string', required: true },
      week: { type: 'number', required: true },
      season: { type: 'number', required: true },
      starters: { type: 'array', required: false },
      bench: { type: 'array', required: false },
    }
  },
  drafts: {
    id: 'drafts',
    attributes: {
      leagueId: { type: 'string', required: true },
      rounds: { type: 'number', required: true },
      order: { type: 'array', required: false },
      status: { type: 'enum', required: true, enumValues: ['scheduled','live','complete'] },
    }
  },
  draft_picks: {
    id: 'draft_picks',
    attributes: {
      leagueId: { type: 'string', required: true },
      userId: { type: 'string', required: true },
      playerId: { type: 'string', required: true },
      round: { type: 'number', required: true },
      pickNumber: { type: 'number', required: true },
      timestamp: { type: 'datetime', required: false },
    }
  }
};

export type CollectionsRegistry = typeof COLLECTIONS;
