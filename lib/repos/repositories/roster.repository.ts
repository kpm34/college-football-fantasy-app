/**
 * Roster Repository
 * Handles team roster operations with real-time updates
 */

import { BaseRepository, QueryOptions } from './base.repository';
import { ValidationError } from '../../domain/errors/app-error';
import { Query } from 'appwrite';
import { SchemaValidator, enforceSchema } from '../../domain/validation/schema-enforcer';
import type { Roster } from '../../types/roster';

export interface CreateRosterData {
  leagueId: string;
  userId: string;
  teamName: string;
  abbreviation: string;
  draftPosition: number;
  logoUrl?: string;
}

export interface UpdateRosterData {
  teamName?: string;
  abbreviation?: string;
  logoUrl?: string;
  lineup?: Record<string, string>;
  bench?: string[];
}

export interface AddPlayerData {
  playerId: string;
  position: string;
  acquisitionType: 'draft' | 'waiver' | 'trade';
  acquisitionDate: string;
}

export class RosterRepository extends BaseRepository<Roster> {
  protected collectionId = 'fantasy_teams';
  protected cachePrefix = 'roster';

  /**
   * Validate roster data using schema enforcer
   */
  protected async validateCreate(data: Partial<Roster>): Promise<void> {
    const validation = SchemaValidator.validate('fantasy_teams', data);
    if (!validation.success) {
      throw new ValidationError(`Roster validation failed: ${validation.errors?.join(', ')}`);
    }
  }

  protected async validateUpdate(id: string, data: Partial<Roster>): Promise<void> {
    const validation = SchemaValidator.validate('fantasy_teams', data);
    if (!validation.success) {
      throw new ValidationError(`Roster validation failed: ${validation.errors?.join(', ')}`);
    }
  }

  /**
   * Get roster by league and user
   */
  async findByLeagueAndUser(leagueId: string, userId: string): Promise<Roster | null> {
    const result = await this.find({
      filters: {
        leagueId,
        owner_client_id: userId  // Using the correct field name from schema
      },
      limit: 1,
      cache: {
        key: `roster:${leagueId}:${userId}`,
        ttl: 300
      }
    });

    return result.documents[0] || null;
  }

  /**
   * Get all rosters in a league
   */
  async findByLeague(leagueId: string, options?: QueryOptions): Promise<{ rosters: Roster[]; total: number }> {
    const result = await this.find({
      ...options,
      filters: {
        ...options?.filters,
        leagueId
      },
      orderBy: options?.orderBy || 'wins',
      orderDirection: options?.orderDirection || 'desc',
      cache: {
        key: `roster:league:${leagueId}:list`,
        ttl: 60 // Cache for 1 minute during active games
      }
    });

    return {
      rosters: result.documents,
      total: result.total
    };
  }

  /**
   * Add player to roster
   */
  async addPlayer(
    fantasy_team_id: string,
    playerData: AddPlayerData
  ): Promise<Roster> {
    const roster = await this.findById(fantasy_team_id);
    if (!roster) {
      throw new ValidationError('Roster not found');
    }

    // Check if player already on roster
    if (roster.players.some(p => p.playerId === playerData.playerId)) {
      throw new ValidationError('Player already on roster');
    }

    // Check roster limits (assuming 20 player max)
    if (roster.players.length >= 20) {
      throw new ValidationError('Roster is full');
    }

    // Add player
    const updatedPlayers = [
      ...roster.players,
      {
        ...playerData,
        addedAt: new Date().toISOString()
      }
    ];

    // Transform data for schema compliance (JSON stringify for large arrays)
    const updateData = SchemaValidator.transform('fantasy_teams', {
      players: JSON.stringify(updatedPlayers),
      updatedAt: new Date().toISOString()
    });

    return this.update(fantasy_team_id, updateData, {
      invalidateCache: [
        `roster:league:${roster.leagueId}:*`,
        `player:roster:${playerData.playerId}`
      ]
    });
  }

  /**
   * Remove player from roster
   */
  async removePlayer(fantasy_team_id: string, playerId: string): Promise<Roster> {
    const roster = await this.findById(fantasy_team_id);
    if (!roster) {
      throw new ValidationError('Roster not found');
    }

    const updatedPlayers = roster.players.filter(p => p.playerId !== playerId);
    if (updatedPlayers.length === roster.players.length) {
      throw new ValidationError('Player not found on roster');
    }

    // Remove from lineup if present
    const updatedLineup = { ...roster.lineup };
    Object.keys(updatedLineup).forEach(position => {
      if (updatedLineup[position] === playerId) {
        delete updatedLineup[position];
      }
    });

    // Remove from bench if present
    const updatedBench = roster.bench.filter(id => id !== playerId);

    return this.update(fantasy_team_id, {
      players: updatedPlayers,
      lineup: updatedLineup,
      bench: updatedBench,
      updatedAt: new Date().toISOString()
    }, {
      invalidateCache: [
        `roster:league:${roster.leagueId}:*`,
        `player:roster:${playerId}`
      ]
    });
  }

  /**
   * Update lineup
   */
  async updateLineup(
    fantasy_team_id: string,
    lineup: Record<string, string>
  ): Promise<Roster> {
    const roster = await this.findById(fantasy_team_id);
    if (!roster) {
      throw new ValidationError('Roster not found');
    }

    // Validate all players are on roster
    const playerIds = Object.values(lineup);
    const rosterPlayerIds = roster.players.map(p => p.playerId);
    
    for (const playerId of playerIds) {
      if (!rosterPlayerIds.includes(playerId)) {
        throw new ValidationError(`Player ${playerId} not on roster`);
      }
    }

    // Validate position requirements
    this.validateLineupPositions(lineup);

    // Update bench (players not in lineup)
    const lineupPlayerIds = new Set(Object.values(lineup));
    const benchPlayers = roster.players
      .filter(p => !lineupPlayerIds.has(p.playerId))
      .map(p => p.playerId);

    return this.update(fantasy_team_id, {
      lineup,
      bench: benchPlayers,
      updatedAt: new Date().toISOString()
    }, {
      partial: true,
      invalidateCache: [`roster:league:${roster.leagueId}:*`]
    });
  }

  /**
   * Update roster stats (usually after games)
   */
  async updateStats(
    fantasy_team_id: string,
    stats: {
      wins?: number;
      losses?: number;
      ties?: number;
      pointsFor?: number;
      pointsAgainst?: number;
    }
  ): Promise<Roster> {
    return this.update(fantasy_team_id, {
      ...stats,
      updatedAt: new Date().toISOString()
    }, {
      partial: true,
      invalidateCache: [`roster:league:*:standings`]
    });
  }

  /**
   * Get league standings
   */
  async getStandings(leagueId: string): Promise<Roster[]> {
    const { rosters } = await this.findByLeague(leagueId, {
      orderBy: 'wins',
      orderDirection: 'desc',
      cache: {
        key: `roster:league:${leagueId}:standings`,
        ttl: 300
      }
    });

    // Sort by wins, then by points for tiebreaker
    return rosters.sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      return b.pointsFor - a.pointsFor;
    });
  }

  /**
   * Execute a trade between rosters
   */
  async executeTrade(
    roster1Id: string,
    roster2Id: string,
    players1: string[], // Players from roster1 going to roster2
    players2: string[]  // Players from roster2 going to roster1
  ): Promise<{ roster1: Roster; roster2: Roster }> {
    // Get both rosters
    const [roster1, roster2] = await Promise.all([
      this.findById(roster1Id),
      this.findById(roster2Id)
    ]);

    if (!roster1 || !roster2) {
      throw new ValidationError('One or both rosters not found');
    }

    if (roster1.leagueId !== roster2.leagueId) {
      throw new ValidationError('Rosters must be in the same league');
    }

    // Validate players exist on correct rosters
    const roster1PlayerIds = roster1.players.map(p => p.playerId);
    const roster2PlayerIds = roster2.players.map(p => p.playerId);

    for (const playerId of players1) {
      if (!roster1PlayerIds.includes(playerId)) {
        throw new ValidationError(`Player ${playerId} not on roster 1`);
      }
    }

    for (const playerId of players2) {
      if (!roster2PlayerIds.includes(playerId)) {
        throw new ValidationError(`Player ${playerId} not on roster 2`);
      }
    }

    // Execute trade
    const now = new Date().toISOString();
    
    // Update roster1
    const updatedRoster1Players = roster1.players
      .filter(p => !players1.includes(p.playerId))
      .concat(
        players2.map(playerId => ({
          playerId,
          position: roster2.players.find(p => p.playerId === playerId)!.position,
          acquisitionType: 'trade' as const,
          acquisitionDate: now,
          addedAt: now
        }))
      );

    // Update roster2
    const updatedRoster2Players = roster2.players
      .filter(p => !players2.includes(p.playerId))
      .concat(
        players1.map(playerId => ({
          playerId,
          position: roster1.players.find(p => p.playerId === playerId)!.position,
          acquisitionType: 'trade' as const,
          acquisitionDate: now,
          addedAt: now
        }))
      );

    // Update both rosters
    const [newRoster1, newRoster2] = await Promise.all([
      this.update(roster1Id, {
        players: updatedRoster1Players,
        updatedAt: now
      }),
      this.update(roster2Id, {
        players: updatedRoster2Players,
        updatedAt: now
      })
    ]);

    // Invalidate caches
    await this.invalidateCache([
      `roster:league:${roster1.leagueId}:*`,
      ...players1.map(p => `player:roster:${p}`),
      ...players2.map(p => `player:roster:${p}`)
    ]);

    return { roster1: newRoster1, roster2: newRoster2 };
  }

  /**
   * Validate lineup positions
   */
  private validateLineupPositions(lineup: Record<string, string>): void {
    const requiredPositions = ['QB', 'RB1', 'RB2', 'WR1', 'WR2', 'TE', 'FLEX', 'K', 'DEF'];
    const missingPositions = requiredPositions.filter(pos => !lineup[pos]);
    
    if (missingPositions.length > 0) {
      throw new ValidationError(`Missing required positions: ${missingPositions.join(', ')}`);
    }
  }

  /**
   * Subscribe to roster changes in a league
   */
  subscribeToLeagueRosters(
    leagueId: string,
    callback: (roster: Roster) => void
  ): () => void {
    if (this.isServer) {
      throw new Error('Realtime subscriptions are only available on client side');
    }

    // Subscribe to all roster documents in the league
    const channel = `databases.${this.databaseId}.collections.${this.collectionId}.documents`;
    
    const unsubscribe = this.subscribeToChanges((response) => {
      const roster = response.payload as Roster;
      if (roster.leagueId === leagueId) {
        callback(roster);
      }
    });

    return unsubscribe;
  }
}
