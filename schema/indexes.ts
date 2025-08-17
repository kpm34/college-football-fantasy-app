/**
 * ADVANCED INDEXING SCHEMA
 * 
 * Defines compound indexes, performance optimizations, and query patterns.
 * This ensures all common queries are fast and efficient.
 */

export interface CompoundIndex {
  key: string;
  type: 'key' | 'fulltext' | 'unique';
  attributes: string[];
  orders?: ('ASC' | 'DESC')[];
  description: string;
  queryPatterns: string[]; // Common queries this index optimizes
  estimatedUsage: 'high' | 'medium' | 'low';
}

export interface IndexProfile {
  collectionId: string;
  description: string;
  commonQueries: string[];
  compoundIndexes: CompoundIndex[];
  singleIndexes: CompoundIndex[];
}

/**
 * PERFORMANCE-OPTIMIZED INDEX DEFINITIONS
 */
export const INDEX_SCHEMA: Record<string, IndexProfile> = {
  // College Players - Heavy query load
  college_players: {
    collectionId: 'college_players',
    description: 'Player database with draft and search optimization',
    commonQueries: [
      'Find available players by position for draft',
      'Search players by name with position filter', 
      'Get top players by fantasy points for position',
      'Filter players by team and eligibility',
      'Rank players by conference and position'
    ],
    compoundIndexes: [
      {
        key: 'draft_availability_idx',
        type: 'key',
        attributes: ['eligible', 'position', 'fantasy_points'],
        orders: ['ASC', 'ASC', 'DESC'],
        description: 'Draft board: eligible players by position, ranked by fantasy points',
        queryPatterns: [
          'eligible = true AND position = ? ORDER BY fantasy_points DESC',
          'eligible = true ORDER BY fantasy_points DESC'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'team_depth_chart_idx',
        type: 'key',
        attributes: ['team', 'position', 'depth_chart_order'],
        orders: ['ASC', 'ASC', 'ASC'],
        description: 'Team depth charts for position rankings',
        queryPatterns: [
          'team = ? AND position = ? ORDER BY depth_chart_order ASC'
        ],
        estimatedUsage: 'medium'
      },
      {
        key: 'conference_rankings_idx',
        type: 'key',
        attributes: ['conference', 'position', 'fantasy_points'],
        orders: ['ASC', 'ASC', 'DESC'],
        description: 'Conference-specific player rankings',
        queryPatterns: [
          'conference = ? AND position = ? ORDER BY fantasy_points DESC',
          'conference IN [...] ORDER BY fantasy_points DESC'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'eligibility_projections_idx',
        type: 'key',
        attributes: ['eligible', 'last_projection_update'],
        orders: ['ASC', 'DESC'],
        description: 'Find players needing projection updates',
        queryPatterns: [
          'eligible = true ORDER BY last_projection_update ASC'
        ],
        estimatedUsage: 'low'
      }
    ],
    singleIndexes: [
      {
        key: 'name_search_idx',
        type: 'fulltext',
        attributes: ['name'],
        description: 'Player name search',
        queryPatterns: ['search("name", query)'],
        estimatedUsage: 'high'
      },
      {
        key: 'external_id_lookup_idx',
        type: 'unique',
        attributes: ['external_id'],
        description: 'API integration lookups',
        queryPatterns: ['external_id = ?'],
        estimatedUsage: 'medium'
      }
    ]
  },

  // Leagues - User dashboard queries
  leagues: {
    collectionId: 'leagues',
    description: 'League browsing and management',
    commonQueries: [
      'Find open public leagues',
      'Get user\'s leagues as commissioner',
      'Browse leagues by game mode',
      'Find leagues ready for draft'
    ],
    compoundIndexes: [
      {
        key: 'public_browsing_idx',
        type: 'key',
        attributes: ['isPublic', 'status', 'gameMode'],
        orders: ['ASC', 'ASC', 'ASC'],
        description: 'Browse available public leagues by game mode',
        queryPatterns: [
          'isPublic = true AND status = "open"',
          'isPublic = true AND status = "open" AND gameMode = ?'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'commissioner_leagues_idx',
        type: 'key',
        attributes: ['commissioner', 'status'],
        orders: ['ASC', 'ASC'],
        description: 'User\'s leagues as commissioner',
        queryPatterns: [
          'commissioner = ? ORDER BY status ASC'
        ],
        estimatedUsage: 'medium'
      },
      {
        key: 'draft_ready_idx',
        type: 'key',
        attributes: ['status', 'draftDate'],
        orders: ['ASC', 'ASC'],
        description: 'Leagues ready for draft or scheduled',
        queryPatterns: [
          'status = "drafting"',
          'status = "open" AND draftDate <= ?'
        ],
        estimatedUsage: 'low'
      }
    ],
    singleIndexes: [
      {
        key: 'league_search_idx',
        type: 'fulltext',
        attributes: ['name'],
        description: 'League name search',
        queryPatterns: ['search("name", query)'],
        estimatedUsage: 'medium'
      }
    ]
  },

  // Rosters - League standings and team management
  rosters: {
    collectionId: 'rosters',
    description: 'Fantasy team rosters and standings',
    commonQueries: [
      'Get league standings (wins/losses)',
      'Find user\'s teams across leagues',
      'League roster management'
    ],
    compoundIndexes: [
      {
        key: 'league_standings_idx',
        type: 'key',
        attributes: ['leagueId', 'wins', 'pointsFor'],
        orders: ['ASC', 'DESC', 'DESC'],
        description: 'League standings with tiebreaker',
        queryPatterns: [
          'leagueId = ? ORDER BY wins DESC, pointsFor DESC'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'user_teams_idx',
        type: 'key',
        attributes: ['userId', 'leagueId'],
        orders: ['ASC', 'ASC'],
        description: 'User\'s teams across multiple leagues',
        queryPatterns: [
          'userId = ?',
          'userId = ? AND leagueId = ?'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'draft_order_idx',
        type: 'key',
        attributes: ['leagueId', 'draftPosition'],
        orders: ['ASC', 'ASC'],
        description: 'Draft order within leagues',
        queryPatterns: [
          'leagueId = ? ORDER BY draftPosition ASC'
        ],
        estimatedUsage: 'medium'
      }
    ],
    singleIndexes: [
      {
        key: 'league_user_unique_idx',
        type: 'unique',
        attributes: ['leagueId', 'userId'],
        description: 'Prevent duplicate team per user per league',
        queryPatterns: ['leagueId = ? AND userId = ?'],
        estimatedUsage: 'medium'
      }
    ]
  },

  // Games - Schedule and scoring queries
  games: {
    collectionId: 'games',
    description: 'Game schedule, scores, and eligibility',
    commonQueries: [
      'Get current week games',
      'Find eligible games for scoring',
      'Team schedule lookups',
      'Live games for scoring updates'
    ],
    compoundIndexes: [
      {
        key: 'weekly_schedule_idx',
        type: 'key',
        attributes: ['season', 'week', 'start_date'],
        orders: ['DESC', 'ASC', 'ASC'],
        description: 'Weekly game schedules',
        queryPatterns: [
          'season = ? AND week = ? ORDER BY start_date ASC',
          'season = ? ORDER BY week ASC, start_date ASC'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'eligible_scoring_idx',
        type: 'key',
        attributes: ['eligible_game', 'completed', 'week'],
        orders: ['ASC', 'ASC', 'ASC'],
        description: 'Games eligible for fantasy scoring',
        queryPatterns: [
          'eligible_game = true AND completed = false',
          'eligible_game = true AND week = ?'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'team_schedule_idx',
        type: 'key',
        attributes: ['home_team', 'season', 'week'],
        orders: ['ASC', 'DESC', 'ASC'],
        description: 'Team home game schedule',
        queryPatterns: [
          'home_team = ? AND season = ? ORDER BY week ASC'
        ],
        estimatedUsage: 'medium'
      },
      {
        key: 'away_schedule_idx',
        type: 'key',
        attributes: ['away_team', 'season', 'week'],
        orders: ['ASC', 'DESC', 'ASC'],
        description: 'Team away game schedule',
        queryPatterns: [
          'away_team = ? AND season = ? ORDER BY week ASC'
        ],
        estimatedUsage: 'medium'
      }
    ],
    singleIndexes: [
      {
        key: 'external_game_idx',
        type: 'unique',
        attributes: ['external_id'],
        description: 'API integration for game data',
        queryPatterns: ['external_id = ?'],
        estimatedUsage: 'low'
      }
    ]
  },

  // Lineups - Weekly lineup management
  lineups: {
    collectionId: 'lineups',
    description: 'Weekly fantasy lineups',
    commonQueries: [
      'Get user lineup for current week',
      'League lineups for scoring',
      'Historical lineup performance'
    ],
    compoundIndexes: [
      {
        key: 'weekly_lineups_idx',
        type: 'key',
        attributes: ['season', 'week', 'rosterId'],
        orders: ['DESC', 'ASC', 'ASC'],
        description: 'Weekly lineup retrieval',
        queryPatterns: [
          'season = ? AND week = ? AND rosterId = ?',
          'season = ? AND week = ?'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'scoring_lineups_idx',
        type: 'key',
        attributes: ['week', 'locked', 'points'],
        orders: ['ASC', 'ASC', 'DESC'],
        description: 'Lineup scoring and rankings',
        queryPatterns: [
          'week = ? AND locked = true ORDER BY points DESC'
        ],
        estimatedUsage: 'medium'
      }
    ],
    singleIndexes: [
      {
        key: 'roster_week_unique_idx',
        type: 'unique',
        attributes: ['rosterId', 'week', 'season'],
        description: 'One lineup per team per week',
        queryPatterns: ['rosterId = ? AND week = ? AND season = ?'],
        estimatedUsage: 'medium'
      }
    ]
  },

  // Player Stats - Performance analytics
  player_stats: {
    collectionId: 'player_stats',
    description: 'Player performance statistics',
    commonQueries: [
      'Player performance by week',
      'Season totals for players',
      'Game-by-game breakdowns'
    ],
    compoundIndexes: [
      {
        key: 'player_weekly_idx',
        type: 'key',
        attributes: ['playerId', 'season', 'week'],
        orders: ['ASC', 'DESC', 'ASC'],
        description: 'Player weekly performance',
        queryPatterns: [
          'playerId = ? AND season = ? ORDER BY week ASC'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'weekly_performances_idx',
        type: 'key',
        attributes: ['season', 'week', 'fantasy_points'],
        orders: ['DESC', 'ASC', 'DESC'],
        description: 'Top weekly performances',
        queryPatterns: [
          'season = ? AND week = ? ORDER BY fantasy_points DESC'
        ],
        estimatedUsage: 'medium'
      }
    ],
    singleIndexes: [
      {
        key: 'player_game_unique_idx',
        type: 'unique',
        attributes: ['playerId', 'gameId'],
        description: 'One stat line per player per game',
        queryPatterns: ['playerId = ? AND gameId = ?'],
        estimatedUsage: 'medium'
      }
    ]
  },

  // Rankings - Poll tracking
  rankings: {
    collectionId: 'rankings',
    description: 'AP Top 25 and poll rankings',
    commonQueries: [
      'Current week AP Top 25',
      'Team ranking history',
      'Poll comparison'
    ],
    compoundIndexes: [
      {
        key: 'weekly_rankings_idx',
        type: 'key',
        attributes: ['season', 'week', 'poll_type', 'rank'],
        orders: ['DESC', 'DESC', 'ASC', 'ASC'],
        description: 'Weekly poll rankings',
        queryPatterns: [
          'season = ? AND week = ? AND poll_type = ? ORDER BY rank ASC'
        ],
        estimatedUsage: 'high'
      },
      {
        key: 'team_ranking_history_idx',
        type: 'key',
        attributes: ['team', 'poll_type', 'season', 'week'],
        orders: ['ASC', 'ASC', 'DESC', 'ASC'],
        description: 'Team ranking progression',
        queryPatterns: [
          'team = ? AND poll_type = ? AND season = ? ORDER BY week ASC'
        ],
        estimatedUsage: 'medium'
      }
    ],
    singleIndexes: []
  },

  // Auctions - Real-time bidding
  auctions: {
    collectionId: 'auctions',
    description: 'Auction draft sessions',
    commonQueries: [
      'Active auction for league',
      'Auction history'
    ],
    compoundIndexes: [
      {
        key: 'active_auctions_idx',
        type: 'key',
        attributes: ['status', 'auctionEndTime'],
        orders: ['ASC', 'ASC'],
        description: 'Find auctions needing attention',
        queryPatterns: [
          'status = "active" AND auctionEndTime <= ?'
        ],
        estimatedUsage: 'low'
      }
    ],
    singleIndexes: [
      {
        key: 'league_auction_idx',
        type: 'key',
        attributes: ['leagueId'],
        description: 'League auction lookup',
        queryPatterns: ['leagueId = ?'],
        estimatedUsage: 'medium'
      }
    ]
  },

  // Bids - Auction history
  bids: {
    collectionId: 'bids',
    description: 'Auction bid tracking',
    commonQueries: [
      'Player bidding history',
      'Team bid history'
    ],
    compoundIndexes: [
      {
        key: 'player_bid_history_idx',
        type: 'key',
        attributes: ['playerId', 'timestamp'],
        orders: ['ASC', 'DESC'],
        description: 'Player auction history',
        queryPatterns: [
          'playerId = ? ORDER BY timestamp DESC'
        ],
        estimatedUsage: 'low'
      },
      {
        key: 'auction_timeline_idx',
        type: 'key',
        attributes: ['auctionId', 'timestamp'],
        orders: ['ASC', 'ASC'],
        description: 'Auction bid timeline',
        queryPatterns: [
          'auctionId = ? ORDER BY timestamp ASC'
        ],
        estimatedUsage: 'low'
      }
    ],
    singleIndexes: []
  }
};

/**
 * INDEX PERFORMANCE ANALYZER
 */
export function analyzeIndexUsage(): {
  highPriority: CompoundIndex[];
  mediumPriority: CompoundIndex[];
  lowPriority: CompoundIndex[];
} {
  const high: CompoundIndex[] = [];
  const medium: CompoundIndex[] = [];
  const low: CompoundIndex[] = [];
  
  for (const profile of Object.values(INDEX_SCHEMA)) {
    for (const index of [...profile.compoundIndexes, ...profile.singleIndexes]) {
      switch (index.estimatedUsage) {
        case 'high': high.push(index); break;
        case 'medium': medium.push(index); break;
        case 'low': low.push(index); break;
      }
    }
  }
  
  return { highPriority: high, mediumPriority: medium, lowPriority: low };
}

/**
 * QUERY OPTIMIZATION RECOMMENDATIONS
 */
export const QUERY_PATTERNS = {
  // Draft board - most common query
  draft_board: {
    description: 'Get available players for draft',
    query: 'eligible = true AND position = ? ORDER BY fantasy_points DESC LIMIT 50',
    requiredIndex: 'draft_availability_idx',
    estimatedQPS: 100 // queries per second during draft
  },
  
  // League standings - displayed on every league page
  league_standings: {
    description: 'Get league standings',
    query: 'leagueId = ? ORDER BY wins DESC, pointsFor DESC',
    requiredIndex: 'league_standings_idx',
    estimatedQPS: 50
  },
  
  // Player search - autocomplete
  player_search: {
    description: 'Player name autocomplete',
    query: 'search("name", query) AND position = ?',
    requiredIndex: 'name_search_idx',
    estimatedQPS: 25
  },
  
  // Weekly schedule - game display
  weekly_games: {
    description: 'Current week games',
    query: 'season = 2025 AND week = ? ORDER BY start_date ASC',
    requiredIndex: 'weekly_schedule_idx',
    estimatedQPS: 20
  }
};

export default INDEX_SCHEMA;