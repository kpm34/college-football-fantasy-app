/**
 * Player ID Mapper
 * 
 * Handles fuzzy matching of player names to canonical player IDs in the
 * college_players collection. Uses multiple matching strategies:
 * - Exact name matching
 * - Fuzzy string matching (Levenshtein distance)
 * - Team + position context matching
 * - Jersey number matching
 * - Previous mapping cache
 */

import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '../../../lib/appwrite-server';
import { Query } from 'node-appwrite';

export interface PlayerMatch {
  college_player_id: string;
  confidence: number;        // 0.0-1.0 match confidence
  match_factors: {
    name_similarity: number; // String similarity score
    team_match: boolean;     // Team name matches
    position_match: boolean; // Position matches
    jersey_match?: boolean;  // Jersey number matches (if available)
  };
  matched_name: string;      // The name that was matched in DB
  reasoning: string;         // Human-readable explanation
}

export interface PlayerCacheEntry {
  raw_name: string;
  team: string;
  position: string;
  player_id: string;
  confidence: number;
  last_used: string;
  use_count: number;
}

export class PlayerIdMapper {
  private cache: Map<string, PlayerCacheEntry> = new Map();
  private collegePlayersCache: Array<{
    $id: string;
    name: string;
    team: string;
    position: string;
    jersey?: string;
  }> = [];
  
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  private readonly CACHE_TTL_HOURS = 24;
  private readonly MAX_CACHE_SIZE = 10000;

  /**
   * Initialize the mapper by loading college players and existing cache
   */
  async initialize(): Promise<void> {
    console.log('[PlayerIdMapper] Initializing player mapping cache...');
    
    try {
      // Load all college players for matching
      await this.loadCollegePlayers();
      
      // Load existing mapping cache from database or file
      await this.loadMappingCache();
      
      console.log(`[PlayerIdMapper] Loaded ${this.collegePlayersCache.length} players, ${this.cache.size} cached mappings`);
    } catch (error) {
      console.error('[PlayerIdMapper] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Map a raw player name to a canonical college player ID
   */
  async mapPlayer(
    rawName: string,
    team: string,
    position: string,
    jersey?: string
  ): Promise<PlayerMatch | null> {
    if (!rawName || rawName.trim().length < 2) {
      return null;
    }

    const normalizedName = this.normalizePlayerName(rawName);
    const normalizedTeam = this.normalizeTeamName(team);
    const normalizedPosition = this.normalizePosition(position);
    
    // Check cache first
    const cacheKey = this.getCacheKey(normalizedName, normalizedTeam, normalizedPosition);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      // Update cache usage
      cached.use_count++;
      cached.last_used = new Date().toISOString();
      
      return {
        college_player_id: cached.player_id,
        confidence: cached.confidence,
        match_factors: {
          name_similarity: 1.0,
          team_match: true,
          position_match: true
        },
        matched_name: cached.raw_name,
        reasoning: 'Cached mapping'
      };
    }

    // Perform fuzzy matching
    const match = await this.performFuzzyMatch(normalizedName, normalizedTeam, normalizedPosition, jersey);
    
    if (match && match.confidence >= this.CONFIDENCE_THRESHOLD) {
      // Cache the successful match
      await this.cacheMapping(normalizedName, normalizedTeam, normalizedPosition, match);
    }

    return match;
  }

  /**
   * Batch map multiple players
   */
  async mapPlayers(
    players: Array<{
      name: string;
      team: string;
      position: string;
      jersey?: string;
    }>
  ): Promise<Array<PlayerMatch | null>> {
    const results: Array<PlayerMatch | null> = [];
    
    for (const player of players) {
      try {
        const match = await this.mapPlayer(player.name, player.team, player.position, player.jersey);
        results.push(match);
        
        // Small delay to avoid overwhelming the system
        if (results.length % 50 === 0) {
          await this.sleep(100);
        }
      } catch (error) {
        console.warn(`[PlayerIdMapper] Failed to map ${player.name}:`, error);
        results.push(null);
      }
    }

    return results;
  }

  /**
   * Get mapping statistics
   */
  getMappingStats(): {
    total_players: number;
    cached_mappings: number;
    cache_hit_rate: number;
    avg_confidence: number;
  } {
    const totalMappings = this.cache.size;
    const totalUsage = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.use_count, 0);
    const avgConfidence = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.confidence, 0) / totalMappings;

    return {
      total_players: this.collegePlayersCache.length,
      cached_mappings: totalMappings,
      cache_hit_rate: totalUsage > 0 ? totalMappings / totalUsage : 0,
      avg_confidence: avgConfidence || 0
    };
  }

  /**
   * Clear old cache entries
   */
  async pruneCache(): Promise<void> {
    const now = new Date().getTime();
    const ttlMs = this.CACHE_TTL_HOURS * 60 * 60 * 1000;
    let prunedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      const entryAge = now - new Date(entry.last_used).getTime();
      
      if (entryAge > ttlMs) {
        this.cache.delete(key);
        prunedCount++;
      }
    }

    // If cache is still too large, remove least used entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.use_count - b.use_count);
      
      const toRemove = this.cache.size - this.MAX_CACHE_SIZE;
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
        prunedCount++;
      }
    }

    if (prunedCount > 0) {
      console.log(`[PlayerIdMapper] Pruned ${prunedCount} cache entries`);
    }
  }

  private async loadCollegePlayers(): Promise<void> {
    try {
      const batchSize = 1000;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const queries = [
          Query.limit(batchSize),
          Query.offset(offset),
          Query.select(['$id', 'name', 'team', 'position', 'jersey'])
        ];

        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PLAYERS || 'college_players',
          queries
        );

        const players = response.documents.map((doc: any) => ({
          $id: doc.$id,
          name: this.normalizePlayerName(doc.name || ''),
          team: this.normalizeTeamName(doc.team || ''),
          position: this.normalizePosition(doc.position || ''),
          jersey: doc.jersey
        }));

        this.collegePlayersCache.push(...players);

        hasMore = response.documents.length === batchSize;
        offset += batchSize;
      }

    } catch (error) {
      console.error('[PlayerIdMapper] Failed to load college players:', error);
      throw error;
    }
  }

  private async loadMappingCache(): Promise<void> {
    // In a production system, this would load from a persistent cache
    // For now, we'll start with an empty cache that builds over time
    this.cache.clear();
  }

  private async performFuzzyMatch(
    name: string,
    team: string,
    position: string,
    jersey?: string
  ): Promise<PlayerMatch | null> {
    let bestMatch: PlayerMatch | null = null;
    let bestScore = 0;

    for (const player of this.collegePlayersCache) {
      const match = this.calculateMatchScore(name, team, position, jersey, player);
      
      if (match.confidence > bestScore) {
        bestScore = match.confidence;
        bestMatch = {
          college_player_id: player.$id,
          confidence: match.confidence,
          match_factors: match.factors,
          matched_name: player.name,
          reasoning: match.reasoning
        };
      }
    }

    return bestMatch;
  }

  private calculateMatchScore(
    name: string,
    team: string,
    position: string,
    jersey: string | undefined,
    player: {$id: string; name: string; team: string; position: string; jersey?: string}
  ): {confidence: number; factors: PlayerMatch['match_factors']; reasoning: string} {
    
    // Name similarity (most important factor)
    const nameSimilarity = this.calculateStringSimilarity(name, player.name);
    
    // Team match (important for disambiguation)
    const teamMatch = this.isTeamMatch(team, player.team);
    
    // Position match (helps with common names)
    const positionMatch = position === player.position;
    
    // Jersey match (strong indicator if available)
    const jerseyMatch = jersey && player.jersey ? jersey === player.jersey : undefined;

    // Weighted scoring
    let confidence = 0;
    const factors = {
      name_similarity: nameSimilarity,
      team_match: teamMatch,
      position_match: positionMatch,
      jersey_match: jerseyMatch
    };

    // Name similarity weight: 60%
    confidence += nameSimilarity * 0.6;

    // Team match weight: 25%
    if (teamMatch) {
      confidence += 0.25;
    }

    // Position match weight: 10%
    if (positionMatch) {
      confidence += 0.1;
    }

    // Jersey match bonus: 5%
    if (jerseyMatch === true) {
      confidence += 0.05;
    } else if (jerseyMatch === false) {
      confidence -= 0.1; // Penalty for jersey mismatch
    }

    // Generate reasoning
    let reasoning = `Name: ${(nameSimilarity * 100).toFixed(1)}%`;
    if (teamMatch) reasoning += ', Team: ✓';
    if (positionMatch) reasoning += ', Position: ✓';
    if (jerseyMatch === true) reasoning += ', Jersey: ✓';
    else if (jerseyMatch === false) reasoning += ', Jersey: ✗';

    return { confidence, factors, reasoning };
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    
    // Use Levenshtein distance for similarity
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 0;
    
    const similarity = (maxLength - distance) / maxLength;
    
    // Boost similarity for name variations
    const boost = this.getNameVariationBoost(str1, str2);
    
    return Math.min(1.0, similarity + boost);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i - 1] + 1, // substitution
            matrix[j][i - 1] + 1,     // insertion
            matrix[j - 1][i] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private getNameVariationBoost(name1: string, name2: string): number {
    // Common name variations that should boost similarity
    const variations: Array<[string, string]> = [
      ['anthony', 'tony'],
      ['william', 'bill'],
      ['robert', 'bob'],
      ['michael', 'mike'],
      ['christopher', 'chris'],
      ['matthew', 'matt'],
      ['daniel', 'dan'],
      ['david', 'dave'],
      ['james', 'jim'],
      ['richard', 'rick']
    ];

    const lower1 = name1.toLowerCase();
    const lower2 = name2.toLowerCase();

    for (const [long, short] of variations) {
      if ((lower1.includes(long) && lower2.includes(short)) ||
          (lower1.includes(short) && lower2.includes(long))) {
        return 0.2; // 20% boost for name variations
      }
    }

    // Check for initials (e.g., "J. Smith" vs "John Smith")
    if (this.isInitialVariation(name1, name2)) {
      return 0.15;
    }

    return 0;
  }

  private isInitialVariation(name1: string, name2: string): boolean {
    const parts1 = name1.split(' ');
    const parts2 = name2.split(' ');

    if (parts1.length !== parts2.length) return false;

    for (let i = 0; i < parts1.length; i++) {
      const part1 = parts1[i];
      const part2 = parts2[i];

      // Check if one is an initial of the other
      if (part1.length === 1 || part1.length === 2 && part1.endsWith('.')) {
        if (part2.charAt(0).toLowerCase() !== part1.charAt(0).toLowerCase()) {
          return false;
        }
      } else if (part2.length === 1 || part2.length === 2 && part2.endsWith('.')) {
        if (part1.charAt(0).toLowerCase() !== part2.charAt(0).toLowerCase()) {
          return false;
        }
      } else if (part1.toLowerCase() !== part2.toLowerCase()) {
        return false;
      }
    }

    return true;
  }

  private isTeamMatch(team1: string, team2: string): boolean {
    // Normalize and compare team names
    const normalized1 = this.normalizeTeamName(team1);
    const normalized2 = this.normalizeTeamName(team2);
    
    if (normalized1 === normalized2) return true;
    
    // Check for common team name variations
    const teamVariations: Record<string, string[]> = {
      'miami': ['miami', 'miami (fl)', 'miami hurricanes'],
      'florida state': ['florida state', 'fsu', 'florida st'],
      'georgia tech': ['georgia tech', 'gt', 'georgia institute of technology'],
      'north carolina': ['north carolina', 'unc', 'north carolina tar heels'],
      'nc state': ['nc state', 'ncsu', 'north carolina state']
    };

    for (const [canonical, variations] of Object.entries(teamVariations)) {
      if (variations.includes(normalized1) && variations.includes(normalized2)) {
        return true;
      }
    }

    return false;
  }

  private normalizePlayerName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(jr\.?|sr\.?|ii|iii|iv|v)\b/gi, '') // Remove suffixes
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private normalizeTeamName(team: string): string {
    return team
      .toLowerCase()
      .replace(/\b(university|of|state|college)\b/gi, '') // Remove common words
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizePosition(position: string): string {
    const positionMap: Record<string, string> = {
      'qb': 'QB',
      'quarterback': 'QB',
      'rb': 'RB',
      'runningback': 'RB',
      'running back': 'RB',
      'hb': 'RB',
      'halfback': 'RB',
      'wr': 'WR',
      'wide receiver': 'WR',
      'receiver': 'WR',
      'te': 'TE',
      'tight end': 'TE',
      'k': 'K',
      'kicker': 'K',
      'pk': 'K'
    };

    const normalized = position.toLowerCase().trim();
    return positionMap[normalized] || position.toUpperCase();
  }

  private getCacheKey(name: string, team: string, position: string): string {
    return `${name}|${team}|${position}`;
  }

  private isCacheValid(entry: PlayerCacheEntry): boolean {
    const now = new Date().getTime();
    const entryTime = new Date(entry.last_used).getTime();
    const ageHours = (now - entryTime) / (1000 * 60 * 60);
    
    return ageHours < this.CACHE_TTL_HOURS;
  }

  private async cacheMapping(
    name: string,
    team: string,
    position: string,
    match: PlayerMatch
  ): Promise<void> {
    const key = this.getCacheKey(name, team, position);
    
    const entry: PlayerCacheEntry = {
      raw_name: name,
      team,
      position,
      player_id: match.college_player_id,
      confidence: match.confidence,
      last_used: new Date().toISOString(),
      use_count: 1
    };

    this.cache.set(key, entry);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}