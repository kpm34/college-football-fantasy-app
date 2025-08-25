/**
 * Appwrite SDK Utilities
 * Comprehensive utility functions for working with the Appwrite SDK
 */

import { ID, Query, Permission, Role } from 'node-appwrite';
import { serverDatabases, serverUsers, DATABASE_ID, COLLECTIONS } from './appwrite-server';
import { databases } from './appwrite'; // client-side
import type { Models } from 'appwrite';

// Export ID utilities for easy access
export { ID, Query, Permission, Role };

/**
 * ID Generation Utilities
 */
export const AppwriteID = {
  /**
   * Generate a unique ID using Appwrite's built-in generator
   */
  unique: () => ID.unique(),
  
  /**
   * Generate a custom ID (must be unique within collection)
   */
  custom: (id: string) => ID.custom(id),
  
  /**
   * Generate a prefixed ID for better organization
   * @param prefix - Prefix for the ID (e.g., 'league', 'player', 'draft')
   * @param customId - Optional custom suffix, otherwise generates unique
   */
  prefixed: (prefix: string, customId?: string) => {
    const suffix = customId || Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    return ID.custom(`${prefix}_${suffix}`);
  },
  
  /**
   * Generate league-specific ID
   */
  forLeague: (leagueId: string, type: string, customId?: string) => {
    const suffix = customId || Date.now().toString(36);
    return ID.custom(`${leagueId}_${type}_${suffix}`);
  }
};

/**
 * Query Builder Utilities
 */
export const AppwriteQuery = {
  // Common query patterns
  byId: (id: string) => Query.equal('$id', id),
  byIds: (ids: string[]) => Query.equal('$id', ids),
  byUser: (userId: string) => Query.equal('userId', userId),
  byLeague: (leagueId: string) => Query.equal('leagueId', leagueId),
  byTeam: (teamId: string) => Query.equal('teamId', teamId),
  byPlayer: (playerId: string) => Query.equal('playerId', playerId),
  bySeason: (season: number) => Query.equal('season', season),
  byWeek: (week: number) => Query.equal('week', week),
  byStatus: (status: string) => Query.equal('status', status),
  byPosition: (position: string) => Query.equal('position', position),
  byConference: (conference: string) => Query.equal('conference', conference),
  
  // Sorting
  sortBy: (attribute: string, direction: 'asc' | 'desc' = 'asc') => 
    direction === 'asc' ? Query.orderAsc(attribute) : Query.orderDesc(attribute),
  sortByCreated: (direction: 'asc' | 'desc' = 'desc') => 
    direction === 'asc' ? Query.orderAsc('$createdAt') : Query.orderDesc('$createdAt'),
  sortByUpdated: (direction: 'asc' | 'desc' = 'desc') => 
    direction === 'asc' ? Query.orderAsc('$updatedAt') : Query.orderDesc('$updatedAt'),
  
  // Pagination
  limit: (count: number) => Query.limit(count),
  offset: (count: number) => Query.offset(count),
  
  // Date ranges
  createdAfter: (date: Date | string) => Query.greaterThan('$createdAt', date),
  createdBefore: (date: Date | string) => Query.lessThan('$createdAt', date),
  updatedAfter: (date: Date | string) => Query.greaterThan('$updatedAt', date),
  
  // Boolean filters
  isActive: () => Query.equal('status', 'active'),
  isComplete: () => Query.equal('status', 'complete'),
  isEnabled: () => Query.equal('enabled', true),
  isEligible: () => Query.equal('eligible', true),
  
  // Numeric comparisons
  greaterThan: (attribute: string, value: number) => Query.greaterThan(attribute, value),
  lessThan: (attribute: string, value: number) => Query.lessThan(attribute, value),
  between: (attribute: string, min: number, max: number) => Query.between(attribute, min, max),
  
  // Text search
  search: (attribute: string, query: string) => Query.search(attribute, query),
  contains: (attribute: string, value: string) => Query.contains(attribute, value),
  startsWith: (attribute: string, value: string) => Query.startsWith(attribute, value),
  endsWith: (attribute: string, value: string) => Query.endsWith(attribute, value),
};

/**
 * Permission Builder Utilities
 */
export const AppwritePermissions = {
  // User permissions
  userRead: (userId: string) => Permission.read(Role.user(userId)),
  userWrite: (userId: string) => Permission.write(Role.user(userId)),
  userUpdate: (userId: string) => Permission.update(Role.user(userId)),
  userDelete: (userId: string) => Permission.delete(Role.user(userId)),
  
  // Team permissions
  teamRead: (teamId: string) => Permission.read(Role.team(teamId)),
  teamWrite: (teamId: string) => Permission.write(Role.team(teamId)),
  teamUpdate: (teamId: string) => Permission.update(Role.team(teamId)),
  
  // Public permissions
  publicRead: () => Permission.read(Role.any()),
  publicWrite: () => Permission.write(Role.any()),
  
  // Guest permissions
  guestRead: () => Permission.read(Role.guests()),
  
  // User + public read (common pattern)
  userAndPublicRead: (userId: string) => [
    Permission.read(Role.user(userId)),
    Permission.read(Role.any())
  ],
  
  // League commissioner permissions
  leagueCommissioner: (commissionerId: string) => [
    Permission.read(Role.user(commissionerId)),
    Permission.write(Role.user(commissionerId)),
    Permission.update(Role.user(commissionerId)),
    Permission.delete(Role.user(commissionerId))
  ],
  
  // League member permissions (read-only)
  leagueMember: (memberIds: string[]) => [
    ...memberIds.map(id => Permission.read(Role.user(id)))
  ]
};

/**
 * Document CRUD Operations with Type Safety
 */
export class AppwriteCollection<T extends Models.Document> {
  constructor(
    private collectionId: string,
    private isServerSide: boolean = false
  ) {}
  
  get db() {
    return this.isServerSide ? serverDatabases : databases;
  }
  
  async create(data: Omit<T, keyof Models.Document>, documentId?: string, permissions?: string[]): Promise<T> {
    return await this.db.createDocument(
      DATABASE_ID,
      this.collectionId,
      documentId || AppwriteID.unique(),
      data,
      permissions
    ) as T;
  }
  
  async get(documentId: string): Promise<T> {
    return await this.db.getDocument(DATABASE_ID, this.collectionId, documentId) as T;
  }
  
  async list(queries?: string[]): Promise<Models.DocumentList<T>> {
    return await this.db.listDocuments(DATABASE_ID, this.collectionId, queries) as Models.DocumentList<T>;
  }
  
  async update(documentId: string, data: Partial<Omit<T, keyof Models.Document>>, permissions?: string[]): Promise<T> {
    return await this.db.updateDocument(
      DATABASE_ID,
      this.collectionId,
      documentId,
      data,
      permissions
    ) as T;
  }
  
  async delete(documentId: string): Promise<void> {
    await this.db.deleteDocument(DATABASE_ID, this.collectionId, documentId);
  }
  
  async count(queries?: string[]): Promise<number> {
    const result = await this.list([...(queries || []), AppwriteQuery.limit(1)]);
    return result.total;
  }
}

/**
 * Typed Collection Instances
 */
export interface LeagueDocument extends Models.Document {
  name: string;
  commissioner: string;
  season: number;
  maxTeams: number;
  currentTeams: number;
  draftType: 'snake' | 'auction';
  gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten';
  status: 'open' | 'full' | 'drafting' | 'active' | 'complete';
  isPublic: boolean;
  pickTimeSeconds: number;
  draftDate?: string;
}

export interface PlayerDocument extends Models.Document {
  name: string;
  position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
  team: string;
  conference: 'SEC' | 'ACC' | 'Big 12' | 'Big Ten';
  fantasy_points: number;
  depth_chart_order?: number;
  eligible: boolean;
  year?: 'FR' | 'SO' | 'JR' | 'SR';
}

export interface GameDocument extends Models.Document {
  week: number;
  season: number;
  season_type: 'regular' | 'postseason';
  home_team: string;
  away_team: string;
  home_score?: number;
  away_score?: number;
  start_date: string;
  completed: boolean;
}

export interface FantasyTeamDocument extends Models.Document {
  leagueId: string;
  userId: string;
  teamName: string;
  draftPosition?: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  players: string; // JSON string
}

// Typed collection instances
export const LeaguesCollection = new AppwriteCollection<LeagueDocument>(COLLECTIONS.LEAGUES);
export const PlayersCollection = new AppwriteCollection<PlayerDocument>(COLLECTIONS.PLAYERS);
export const GamesCollection = new AppwriteCollection<GameDocument>(COLLECTIONS.GAMES);
export const FantasyTeamsCollection = new AppwriteCollection<FantasyTeamDocument>(COLLECTIONS.FANTASY_TEAMS);

// Server-side versions (with API key access)
export const ServerLeaguesCollection = new AppwriteCollection<LeagueDocument>(COLLECTIONS.LEAGUES, true);
export const ServerPlayersCollection = new AppwriteCollection<PlayerDocument>(COLLECTIONS.PLAYERS, true);
export const ServerGamesCollection = new AppwriteCollection<GameDocument>(COLLECTIONS.GAMES, true);
export const ServerFantasyTeamsCollection = new AppwriteCollection<FantasyTeamDocument>(COLLECTIONS.FANTASY_TEAMS, true);

/**
 * Common Database Operations
 */
export const AppwriteOperations = {
  /**
   * Get user's leagues
   */
  async getUserLeagues(userId: string): Promise<Models.DocumentList<LeagueDocument>> {
    return await LeaguesCollection.list([
      AppwriteQuery.byUser(userId),
      AppwriteQuery.sortByUpdated('desc')
    ]);
  },
  
  /**
   * Get league members
   */
  async getLeagueMembers(leagueId: string): Promise<Models.DocumentList<FantasyTeamDocument>> {
    return await FantasyTeamsCollection.list([
      AppwriteQuery.byLeague(leagueId),
      AppwriteQuery.sortBy('teamName')
    ]);
  },
  
  /**
   * Get available players for draft
   */
  async getAvailablePlayers(position?: string, limit: number = 50): Promise<Models.DocumentList<PlayerDocument>> {
    const queries = [
      AppwriteQuery.isEligible(),
      AppwriteQuery.sortBy('fantasy_points', 'desc'),
      AppwriteQuery.limit(limit)
    ];
    
    if (position) {
      queries.push(AppwriteQuery.byPosition(position));
    }
    
    return await PlayersCollection.list(queries);
  },
  
  /**
   * Get current week games
   */
  async getCurrentWeekGames(season: number, week: number): Promise<Models.DocumentList<GameDocument>> {
    return await GamesCollection.list([
      AppwriteQuery.bySeason(season),
      AppwriteQuery.byWeek(week),
      AppwriteQuery.sortBy('start_date')
    ]);
  }
};

/**
 * Batch Operations
 */
export const AppwriteBatch = {
  /**
   * Create multiple documents in parallel
   */
  async createMany<T extends Models.Document>(
    collection: AppwriteCollection<T>,
    documents: Array<{ data: Omit<T, keyof Models.Document>; id?: string; permissions?: string[] }>
  ): Promise<T[]> {
    const promises = documents.map(({ data, id, permissions }) =>
      collection.create(data, id, permissions)
    );
    return await Promise.all(promises);
  },
  
  /**
   * Update multiple documents in parallel
   */
  async updateMany<T extends Models.Document>(
    collection: AppwriteCollection<T>,
    updates: Array<{ id: string; data: Partial<Omit<T, keyof Models.Document>>; permissions?: string[] }>
  ): Promise<T[]> {
    const promises = updates.map(({ id, data, permissions }) =>
      collection.update(id, data, permissions)
    );
    return await Promise.all(promises);
  },
  
  /**
   * Delete multiple documents in parallel
   */
  async deleteMany<T extends Models.Document>(
    collection: AppwriteCollection<T>,
    documentIds: string[]
  ): Promise<void> {
    const promises = documentIds.map(id => collection.delete(id));
    await Promise.all(promises);
  }
};

/**
 * Validation Helpers
 */
export const AppwriteValidation = {
  /**
   * Validate document ID format
   */
  isValidId: (id: string): boolean => {
    return /^[a-zA-Z0-9._-]{1,36}$/.test(id);
  },
  
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  /**
   * Validate season year
   */
  isValidSeason: (year: number): boolean => {
    return year >= 2020 && year <= 2030;
  },
  
  /**
   * Validate week number
   */
  isValidWeek: (week: number): boolean => {
    return week >= 1 && week <= 20;
  },
  
  /**
   * Validate position
   */
  isValidPosition: (position: string): boolean => {
    return ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(position);
  },
  
  /**
   * Validate conference
   */
  isValidConference: (conference: string): boolean => {
    return ['SEC', 'ACC', 'Big 12', 'Big Ten'].includes(conference);
  }
};

/**
 * Error Handling Utilities
 */
export class AppwriteError extends Error {
  constructor(
    message: string,
    public code?: number,
    public type?: string
  ) {
    super(message);
    this.name = 'AppwriteError';
  }
}

export const AppwriteErrorHandler = {
  /**
   * Handle common Appwrite errors
   */
  handle: (error: any): AppwriteError => {
    if (error.code) {
      switch (error.code) {
        case 404:
          return new AppwriteError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
        case 401:
          return new AppwriteError('Unauthorized access', 401, 'UNAUTHORIZED');
        case 403:
          return new AppwriteError('Forbidden operation', 403, 'FORBIDDEN');
        case 409:
          return new AppwriteError('Document already exists', 409, 'DOCUMENT_EXISTS');
        default:
          return new AppwriteError(error.message || 'Unknown Appwrite error', error.code, 'UNKNOWN');
      }
    }
    return new AppwriteError(error.message || 'Unknown error', 500, 'INTERNAL_ERROR');
  },
  
  /**
   * Check if error is a specific type
   */
  isNotFound: (error: any): boolean => error.code === 404,
  isUnauthorized: (error: any): boolean => error.code === 401,
  isForbidden: (error: any): boolean => error.code === 403,
  isDuplicate: (error: any): boolean => error.code === 409
};

export default {
  ID: AppwriteID,
  Query: AppwriteQuery,
  Permissions: AppwritePermissions,
  Operations: AppwriteOperations,
  Batch: AppwriteBatch,
  Validation: AppwriteValidation,
  ErrorHandler: AppwriteErrorHandler,
  Collections: {
    Leagues: LeaguesCollection,
    Players: PlayersCollection,
    Games: GamesCollection,
    FantasyTeams: FantasyTeamsCollection
  },
  ServerCollections: {
    Leagues: ServerLeaguesCollection,
    Players: ServerPlayersCollection,
    Games: ServerGamesCollection,
    FantasyTeams: ServerFantasyTeamsCollection
  }
};