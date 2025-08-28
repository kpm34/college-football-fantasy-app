/**
 * League Repository
 * Handles all league-related database operations with caching
 */

import { BaseRepository, QueryOptions } from './base.repository';
import { ValidationError, ForbiddenError } from '../../domain/errors/app-error';
import { ID } from 'appwrite';
import { env } from '../../config/environment';
import type { League } from '../../types/league';
import { RosterRepository } from './roster.repository';
import { SchemaValidator, enforceSchema } from '../../domain/validation/schema-enforcer';

export interface CreateLeagueData {
  leagueName: string;
  maxTeams: number;
  draftType: 'snake' | 'auction';
  gameMode: 'power4' | 'sec' | 'acc' | 'big12' | 'bigten';
  isPublic: boolean;
  pickTimeSeconds: number;
  commissionerAuthUserId: string;
  scoringRules?: Record<string, number>;
  draftDate?: string;
  season?: number;
  selectedConference?: string; // For conference mode leagues
}

export interface UpdateLeagueData {
  name?: string;
  maxTeams?: number;
  isPublic?: boolean;
  pickTimeSeconds?: number;
  scoringRules?: Record<string, number>;
  draftDate?: string;
}

export class LeagueRepository extends BaseRepository<League> {
  protected collectionId = 'leagues';
  protected cachePrefix = 'league';

  /**
   * Create a new league with proper defaults
   */
  async createLeague(data: CreateLeagueData): Promise<League> {
    // Set defaults and map fields to match database schema
    // Explicitly clean and type-cast all data to prevent schema conflicts
    const leagueData: any = {
      leagueName: String(data.leagueName).trim(),
      maxTeams: Number(data.maxTeams),
      draftType: String(data.draftType) as 'snake' | 'auction',
      gameMode: String(data.gameMode) as 'power4' | 'sec' | 'acc' | 'big12' | 'bigten',
      isPublic: Boolean(data.isPublic),
      pickTimeSeconds: Number(data.pickTimeSeconds),
      commissionerAuthUserId: String(data.commissionerAuthUserId),
      // Avoid writing attributes not present in some live schemas (leagueStatus/draftStatus/currentTeams)
      season: Number(data.season || new Date().getFullYear()),
      scoringRules: JSON.stringify(data.scoringRules || this.getDefaultScoringRules())
    };

    // Add selectedConference if provided (for conference mode leagues)
    if (data.selectedConference) {
      leagueData.selectedConference = String(data.selectedConference);
    }

    // Add draftDate if provided
    if (data.draftDate) {
      leagueData.draftDate = data.draftDate;
    }

    // Schema validation - ensure data conforms to canonical schema
    const validation = SchemaValidator.validate('leagues', leagueData);
    if (!validation.success) {
      throw new ValidationError(`League creation failed schema validation: ${validation.errors?.join(', ')}`);
    }

    return this.create(validation.data, {
      invalidateCache: ['league:public:*', `league:user:${data.commissionerAuthUserId}:*`]
    });
  }

  /**
   * Find leagues a user is part of
   */
  async findUserLeagues(userId: string, options?: QueryOptions): Promise<{ leagues: League[]; total: number }> {
    // First get all rosters for the user
    const rosterRepo = new RosterRepository(this.isServer, this.client);
    const { documents: rosters } = await rosterRepo.find({
      filters: { authUserId: userId }, // use new field
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
        leagueStatus: 'open'
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
  ): Promise<{ league: League; fantasyTeamId: string }> {
    // Get league with fresh data (bypass cache)
    const league = await this.findById(leagueId, { cache: { bypass: true } });
    if (!league) {
      throw new ValidationError('League not found');
    }

    // Validate join conditions (treat missing leagueStatus as 'open' by default for backwards-compat)
    const effectiveStatus = (league as any).leagueStatus || 'open';
    if (effectiveStatus !== 'open') {
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
        ownerAuthUserId: userId // Use correct field name from Appwrite schema
      }
    });

    if (existingRoster.total > 0) {
      throw new ValidationError('You are already in this league');
    }

    // Create roster entry (using field names that exist in Appwrite collection)
    // Based on Appwrite console: leagueId, teamName, abbrev, logoUrl, wins, losses, ties, 
    // pointsFor, pointsAgainst, draftPosition, auctionBudgetTotal, auctionBudgetRemaining, 
    // displayName, ownerAuthUserId
    const cleanRosterData = {
      leagueId: String(leagueId),
      ownerAuthUserId: String(userId),
      teamName: String(teamName),
      abbrev: String(abbreviation || teamName.substring(0, 3).toUpperCase()),
      draftPosition: Number(league.currentTeams + 1),
      // Persist human-readable league name for UI convenience
      leagueName: String((league as any).leagueName || (league as any).name || ''),
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0
    };

    // Schema validation for roster data
    const rosterValidation = SchemaValidator.validate('fantasy_teams', cleanRosterData);
    if (!rosterValidation.success) {
      throw new ValidationError(`Roster creation failed schema validation: ${rosterValidation.errors?.join(', ')}`);
    }
    
    const roster = await rosterRepo.create(rosterValidation.data);

    // Update league team count
    let updatedLeague: League;
    try {
      updatedLeague = await this.update(leagueId, {
        currentTeams: (league as any).currentTeams ? (league as any).currentTeams + 1 : 1,
        leagueStatus: ((league as any).currentTeams ? (league as any).currentTeams + 1 : 1) >= league.maxTeams ? 'closed' : 'open'
      }, {
        invalidateCache: [
          'league:public:*',
          `league:user:${userId}:*`
        ]
      });
    } catch {
      // If schema does not allow these fields, return the original league
      updatedLeague = league;
    }

    return { league: updatedLeague, fantasyTeamId: roster.$id };
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

    if (league.commissioner !== userId) {
      throw new ForbiddenError('Only the commissioner can update league settings');
    }

    // Don't allow certain changes after draft starts
    if ((league as any).draftStatus === 'drafting') {
      delete updates.maxTeams;
      delete updates.scoringRules;
    }

    return this.update(leagueId, {
      ...updates
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

    if (league.commissioner !== userId) {
      throw new ForbiddenError('Only the commissioner can start the draft');
    }

    if (league.currentTeams < league.maxTeams) {
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
      draftStatus: 'drafting',
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
    const effectiveName = (data as any).leagueName || data.name;
    if (!effectiveName || String(effectiveName).trim().length < 3) {
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
