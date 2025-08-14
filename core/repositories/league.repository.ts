/**
 * League Repository
 * Handles all league-related database operations with caching
 */

import { BaseRepository, QueryOptions } from './base.repository';
import { ValidationError, ForbiddenError } from '../errors/app-error';
import { ID } from 'appwrite';
import { env } from '../config/environment';
import type { League } from '../../types/league';

export interface CreateLeagueData {
  name: string;
  maxTeams: number;
  draftType: 'snake' | 'auction';
  gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten';
  isPublic: boolean;
  pickTimeSeconds: number;
  commissionerId: string;
  scoringRules?: Record<string, number>;
  draftDate?: string;
  season?: number;
}

export interface UpdateLeagueData {
  name?: string;
  maxTeams?: number;
  isPublic?: boolean;
  pickTimeSeconds?: number;
  scoringRules?: Record<string, number>;
  draftDate?: string;
  settings?: Record<string, any>;
}

export class LeagueRepository extends BaseRepository<League> {
  protected collectionId = 'leagues';
  protected cachePrefix = 'league';

  /**
   * Create a new league with proper defaults
   */
  async createLeague(data: CreateLeagueData): Promise<League> {
    // Set defaults
    const leagueData = {
      ...data,
      status: 'open',
      currentTeams: 0,
      season: data.season || new Date().getFullYear(),
      scoringRules: data.scoringRules || this.getDefaultScoringRules(),
      settings: {
        allowTrades: true,
        tradeDeadline: null,
        waiverPeriodDays: 2,
        playoffTeams: 4,
        regularSeasonWeeks: 12,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.create(leagueData, {
      invalidateCache: ['league:public:*', `league:user:${data.commissionerId}:*`]
    });
  }

  /**
   * Find leagues a user is part of
   */
  async findUserLeagues(userId: string, options?: QueryOptions): Promise<{ leagues: League[]; total: number }> {
    // First get all rosters for the user
    const rosterRepo = new RosterRepository(this.isServer, this.client);
    const { documents: rosters } = await rosterRepo.find({
      filters: { userId },
      cache: {
        key: `roster:user:${userId}`,
        ttl: 300
      }
    });

    if (rosters.length === 0) {
      return { leagues: [], total: 0 };
    }

    // Get unique league IDs
    const leagueIds = [...new Set(rosters.map(r => r.leagueId))];

    // Fetch leagues
    const result = await this.find({
      ...options,
      filters: {
        ...options?.filters,
        $id: leagueIds
      },
      cache: {
        key: `league:user:${userId}:list`,
        ttl: 300
      }
    });

    return {
      leagues: result.documents,
      total: result.total
    };
  }

  /**
   * Find public leagues to join
   */
  async findPublicLeagues(options?: QueryOptions): Promise<{ leagues: League[]; total: number }> {
    const result = await this.find({
      ...options,
      filters: {
        ...options?.filters,
        isPublic: true,
        status: 'open'
      },
      orderBy: 'createdAt',
      orderDirection: 'desc',
      cache: {
        key: 'league:public:list',
        ttl: 60 // Cache for 1 minute since these change frequently
      }
    });

    // Filter out full leagues
    const availableLeagues = result.documents.filter(
      league => league.currentTeams < league.maxTeams
    );

    return {
      leagues: availableLeagues,
      total: availableLeagues.length
    };
  }

  /**
   * Join a league
   */
  async joinLeague(
    leagueId: string, 
    userId: string, 
    teamName: string,
    abbreviation?: string
  ): Promise<{ league: League; rosterId: string }> {
    // Get league with fresh data (bypass cache)
    const league = await this.findById(leagueId, { cache: { bypass: true } });
    if (!league) {
      throw new ValidationError('League not found');
    }

    // Validate join conditions
    if (league.status !== 'open') {
      throw new ValidationError('League is not open for joining');
    }

    if (league.currentTeams >= league.maxTeams) {
      throw new ValidationError('League is full');
    }

    // Check if user already in league
    const rosterRepo = new RosterRepository(this.isServer, this.client);
    const existingRoster = await rosterRepo.find({
      filters: {
        leagueId,
        userId
      }
    });

    if (existingRoster.total > 0) {
      throw new ValidationError('You are already in this league');
    }

    // Create roster entry
    const roster = await rosterRepo.create({
      leagueId,
      userId,
      teamName,
      abbreviation: abbreviation || teamName.substring(0, 3).toUpperCase(),
      draftPosition: league.currentTeams + 1,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      players: [],
      lineup: {},
      bench: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Update league team count
    const updatedLeague = await this.update(leagueId, {
      currentTeams: league.currentTeams + 1,
      status: league.currentTeams + 1 >= league.maxTeams ? 'full' : 'open'
    }, {
      invalidateCache: [
        'league:public:*',
        `league:user:${userId}:*`
      ]
    });

    return { league: updatedLeague, rosterId: roster.$id };
  }

  /**
   * Update league settings (commissioner only)
   */
  async updateLeagueSettings(
    leagueId: string,
    userId: string,
    updates: UpdateLeagueData
  ): Promise<League> {
    const league = await this.findById(leagueId);
    if (!league) {
      throw new ValidationError('League not found');
    }

    if (league.commissionerId !== userId) {
      throw new ForbiddenError('Only the commissioner can update league settings');
    }

    // Don't allow certain changes after draft starts
    if (league.status === 'drafting' || league.status === 'active') {
      delete updates.maxTeams;
      delete updates.scoringRules;
    }

    return this.update(leagueId, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, {
      partial: true,
      invalidateCache: [
        'league:public:*',
        `league:user:*`
      ]
    });
  }

  /**
   * Start draft (commissioner only)
   */
  async startDraft(leagueId: string, userId: string): Promise<League> {
    const league = await this.findById(leagueId);
    if (!league) {
      throw new ValidationError('League not found');
    }

    if (league.commissionerId !== userId) {
      throw new ForbiddenError('Only the commissioner can start the draft');
    }

    if (league.status !== 'full') {
      throw new ValidationError('League must be full to start draft');
    }

    // Create draft order
    const rosterRepo = new RosterRepository(this.isServer, this.client);
    const { documents: rosters } = await rosterRepo.find({
      filters: { leagueId },
      orderBy: 'draftPosition',
      orderDirection: 'asc'
    });

    // Initialize draft state in Vercel KV for real-time performance
    if (env.features.caching) {
      try {
        const { kv } = await import('@vercel/kv');
        await kv.hset(`draft:${leagueId}`, {
          currentRound: 1,
          currentPick: 1,
          totalPicks: 0,
          draftOrder: rosters.map(r => r.$id),
          startTime: new Date().toISOString(),
          pickDeadline: new Date(Date.now() + league.pickTimeSeconds * 1000).toISOString()
        });
      } catch (error) {
        console.warn('Failed to initialize draft state in KV:', error);
      }
    }

    return this.update(leagueId, {
      status: 'drafting',
      draftStartedAt: new Date().toISOString()
    }, {
      partial: true,
      invalidateCache: [`league:${leagueId}:*`]
    });
  }

  /**
   * Get default scoring rules
   */
  private getDefaultScoringRules(): Record<string, number> {
    return {
      // Passing
      passingYards: 0.04,      // 1 point per 25 yards
      passingTouchdowns: 4,
      passingInterceptions: -2,
      
      // Rushing
      rushingYards: 0.1,       // 1 point per 10 yards
      rushingTouchdowns: 6,
      
      // Receiving
      receivingYards: 0.1,     // 1 point per 10 yards
      receivingTouchdowns: 6,
      receptions: 1,           // PPR
      
      // Defense
      sacks: 1,
      interceptions: 2,
      forcedFumbles: 2,
      fumbleRecoveries: 2,
      defensiveTouchdowns: 6,
      safeties: 2,
      
      // Kicking
      fieldGoalMade: 3,
      fieldGoalMissed: -1,
      extraPointMade: 1,
      extraPointMissed: -1,
    };
  }

  /**
   * Validate league creation data
   */
  protected async validateCreate(data: Partial<League>): Promise<void> {
    if (!data.name || data.name.length < 3) {
      throw new ValidationError('League name must be at least 3 characters');
    }

    if (!data.maxTeams || data.maxTeams < 4 || data.maxTeams > 20) {
      throw new ValidationError('League must have between 4 and 20 teams');
    }

    if (!['snake', 'auction'].includes(data.draftType!)) {
      throw new ValidationError('Invalid draft type');
    }

    if (!['power4', 'sec', 'acc', 'big12', 'bigten'].includes(data.gameMode!)) {
      throw new ValidationError('Invalid game mode');
    }
  }
}

// Import after class definition to avoid circular dependency
import { RosterRepository } from './roster.repository';
