// Centralized Appwrite Configuration
// This file contains all Appwrite-related configuration used across the application

export const APPWRITE_CONFIG = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy',
  
  // Collection IDs
  collections: {
    GAMES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES || 'games',
    RANKINGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS || 'rankings',
    TEAMS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS || 'teams',
    LEAGUES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES || 'leagues',
    ROSTERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROSTERS || 'rosters',
    COLLEGE_PLAYERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_COLLEGE_PLAYERS || 'college_players',
    USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS || 'users',
    USER_TEAMS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USER_TEAMS || 'user_teams',
    LINEUPS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_LINEUPS || 'lineups',
    DRAFT_PICKS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFT_PICKS || 'draft_picks',
    PLAYER_PROJECTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_PROJECTIONS || 'player_projections',
    SCHEDULE: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SCHEDULE || 'schedule',
    SCORING_RESULTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SCORING_RESULTS || 'scoring_results',
  }
};

// Export individual config items for backward compatibility
export const APPWRITE_ENDPOINT = APPWRITE_CONFIG.endpoint;
export const APPWRITE_PROJECT_ID = APPWRITE_CONFIG.projectId;
export const DATABASE_ID = APPWRITE_CONFIG.databaseId;
export const COLLECTIONS = APPWRITE_CONFIG.collections;
