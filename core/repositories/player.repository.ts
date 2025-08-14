/**
 * Player Repository
 * Handles player data with intelligent caching and search
 */

import { BaseRepository, QueryOptions } from './base.repository';
import { Query } from 'appwrite';
import { env } from '../config/environment';
import type { Player } from '../../types/player';

export interface PlayerSearchOptions extends QueryOptions {
  position?: string;
  team?: string;
  conference?: string;
  available?: boolean;
  minProjectedPoints?: number;
}

export interface PlayerStats {
  week: number;
  opponent: string;
  stats: Record<string, number>;
  fantasyPoints: number;
}

export class PlayerRepository extends BaseRepository<Player> {
  protected collectionId = 'college_players';
  protected cachePrefix = 'player';
  protected defaultCacheTTL = 3600; // 1 hour for player data

  /**
   * Search players with filters
   */
  async searchPlayers(options: PlayerSearchOptions): Promise<{ players: Player[]; total: number }> {
    const queries: string[] = [];

    // Build search queries
    if (options.position) {
      queries.push(Query.equal('position', [options.position]));
    }
    if (options.team) {
      queries.push(Query.equal('team', [options.team]));
    }
    if (options.conference) {
      queries.push(Query.equal('conference', [options.conference]));
    }
    if (options.search) {
      queries.push(Query.search('name', options.search));
    }

    // Get all players
    const result = await this.find({
      ...options,
      filters: {
        position: options.position,
        team: options.team,
        conference: options.conference
      },
      cache: {
        key: `player:search:${JSON.stringify(options)}`,
        ttl: 300 // 5 minute cache for searches
      }
    });

    // If checking availability, need to filter out drafted players
    if (options.available) {
      const availablePlayers = await this.filterAvailablePlayers(
        result.documents,
        options.filters?.leagueId
      );
      return {
        players: availablePlayers,
        total: availablePlayers.length
      };
    }

    return {
      players: result.documents,
      total: result.total
    };
  }

  /**
   * Get top players by position
   */
  async getTopPlayersByPosition(
    position: string,
    limit: number = 10,
    conference?: string
  ): Promise<Player[]> {
    const cacheKey = `player:top:${position}:${conference || 'all'}:${limit}`;
    
    // Check cache first
    const cached = await this.getFromCache<Player[]>(cacheKey);
    if (cached) return cached;

    const filters: Record<string, any> = { position };
    if (conference) {
      filters.conference = conference;
    }

    const result = await this.find({
      filters,
      orderBy: 'projectedPoints',
      orderDirection: 'desc',
      limit
    });

    // Cache the results
    await this.setCache(cacheKey, result.documents, 3600); // 1 hour

    return result.documents;
  }

  /**
   * Get players by team
   */
  async getPlayersByTeam(team: string): Promise<Player[]> {
    const result = await this.find({
      filters: { team },
      orderBy: 'position',
      orderDirection: 'asc',
      cache: {
        key: `player:team:${team}`,
        ttl: 3600
      }
    });

    return result.documents;
  }

  /**
   * Get draftable players for a league
   */
  async getDraftablePlayers(
    leagueId: string,
    conference?: string
  ): Promise<Player[]> {
    // Get conference filter based on league settings
    const leagueRepo = new LeagueRepository(this.isServer, this.client);
    const league = await leagueRepo.findById(leagueId);
    
    if (!league) {
      throw new Error('League not found');
    }

    let conferenceFilter: string[] = [];
    switch (league.gameMode) {
      case 'power4':
        conferenceFilter = ['SEC', 'ACC', 'Big 12', 'Big Ten'];
        break;
      case 'sec':
        conferenceFilter = ['SEC'];
        break;
      case 'acc':
        conferenceFilter = ['ACC'];
        break;
      case 'big12':
        conferenceFilter = ['Big 12'];
        break;
      case 'bigten':
        conferenceFilter = ['Big Ten'];
        break;
    }

    // Get all eligible players
    const result = await this.find({
      filters: {
        conference: conferenceFilter,
        eligible: true // Only players eligible vs Top 25
      },
      limit: 1000, // Get a large batch
      cache: {
        key: `player:draftable:${leagueId}`,
        ttl: 300
      }
    });

    // Filter out already drafted players
    const availablePlayers = await this.filterAvailablePlayers(
      result.documents,
      leagueId
    );

    return availablePlayers;
  }

  /**
   * Update player projections (batch update)
   */
  async updateProjections(projections: { playerId: string; points: number }[]): Promise<void> {
    // Use Vercel KV for fast projection updates if available
    if (env.features.caching) {
      try {
        const { kv } = await import('@vercel/kv');
        const pipeline = kv.pipeline();

        for (const { playerId, points } of projections) {
          // Update in KV for fast access
          pipeline.hset(`projection:week:current`, {
            [playerId]: points
          });
        }

        await pipeline.exec();
      } catch (error) {
        console.warn('Failed to update projections in KV:', error);
      }
    }

    // Always update in database
    for (const { playerId, points } of projections) {
      await this.update(playerId, {
        projectedPoints: points,
        lastProjectionUpdate: new Date().toISOString()
      }, {
        partial: true
      });
    }

    // Invalidate related caches
    await this.invalidateCache([
      'player:top:*',
      'player:search:*'
    ]);
  }

  /**
   * Get player with real-time stats
   */
  async getPlayerWithStats(playerId: string): Promise<Player & { liveStats?: any }> {
    // Get base player data
    const player = await this.findById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Check for live stats in KV if available
    let liveStats = null;
    if (env.features.caching) {
      try {
        const { kv } = await import('@vercel/kv');
        liveStats = await kv.hget('live:stats', playerId);
      } catch (error) {
        console.warn('Failed to get live stats from KV:', error);
      }
    }

    return {
      ...player,
      liveStats
    };
  }

  /**
   * Bulk import players (for data sync)
   */
  async bulkImport(players: Partial<Player>[]): Promise<void> {
    // Process in batches of 100
    const batchSize = 100;
    
    for (let i = 0; i < players.length; i += batchSize) {
      const batch = players.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (playerData) => {
          try {
            // Check if player exists
            const existing = await this.find({
              filters: {
                externalId: playerData.externalId
              },
              limit: 1
            });

            if (existing.documents.length > 0) {
              // Update existing
              await this.update(existing.documents[0].$id, playerData, {
                partial: true
              });
            } else {
              // Create new
              await this.create(playerData);
            }
          } catch (error) {
            console.error(`Failed to import player ${playerData.name}:`, error);
          }
        })
      );
    }

    // Clear all player caches after bulk import
    await this.invalidateCache(['player:*']);
  }

  /**
   * Filter out drafted players
   */
  private async filterAvailablePlayers(
    players: Player[],
    leagueId?: string
  ): Promise<Player[]> {
    if (!leagueId) return players;

    // Get all drafted players in the league
    const rosterRepo = new RosterRepository(this.isServer, this.client);
    const { rosters } = await rosterRepo.findByLeague(leagueId);

    const draftedPlayerIds = new Set(
      rosters.flatMap(roster => roster.players.map(p => p.playerId))
    );

    return players.filter(player => !draftedPlayerIds.has(player.$id));
  }

  /**
   * Get player rankings with caching
   */
  async getPlayerRankings(
    position?: string,
    week?: number
  ): Promise<Player[]> {
    const cacheKey = `player:rankings:${position || 'all'}:week${week || 'season'}`;
    
    // Check cache
    const cached = await this.getFromCache<Player[]>(cacheKey);
    if (cached) return cached;

    const filters: Record<string, any> = {};
    if (position) filters.position = position;

    const result = await this.find({
      filters,
      orderBy: week ? `weeklyStats.${week}.fantasyPoints` : 'seasonFantasyPoints',
      orderDirection: 'desc',
      limit: 100
    });

    // Cache for 1 hour
    await this.setCache(cacheKey, result.documents, 3600);

    return result.documents;
  }

  /**
   * Subscribe to player updates (client-side only)
   */
  subscribeToPlayerUpdates(
    playerId: string,
    callback: (player: Player) => void
  ): () => void {
    return this.subscribeToChanges((response) => {
      callback(response.payload as Player);
    }, playerId);
  }

  /**
   * Validate player data
   */
  protected async validateCreate(data: Partial<Player>): Promise<void> {
    if (!data.name) {
      throw new Error('Player name is required');
    }
    if (!data.position) {
      throw new Error('Player position is required');
    }
    if (!data.team) {
      throw new Error('Player team is required');
    }
    if (!data.conference) {
      throw new Error('Player conference is required');
    }
  }
}

// Import after class definition to avoid circular dependency
import { LeagueRepository } from './league.repository';
import { RosterRepository } from './roster.repository';
