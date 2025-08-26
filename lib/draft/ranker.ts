/**
 * Player Ranking and Scoring for Bot Draft Strategy
 */

import { Player, TeamNeeds, BotStrategyConfig, DEFAULT_BOT_STRATEGY, DEFAULT_POSITION_LIMITS } from './types';
import { getPositionScarcity } from './playerPool';

/**
 * Create a deterministic pseudo-random number generator using a seed
 */
function createSeededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return function() {
    hash = ((hash * 9301) + 49297) % 233280;
    return hash / 233280;
  };
}

/**
 * Score a player for a specific team using deterministic bot strategy
 */
export function scorePlayer(
  player: Player,
  teamNeeds: TeamNeeds,
  availablePlayers: Player[],
  strategy: BotStrategyConfig = DEFAULT_BOT_STRATEGY,
  seed: string = 'default-seed'
): number {
  const seededRandom = createSeededRandom(seed + player.id + teamNeeds.slot);
  
  // 1. Base ranking score (higher fantasyPoints = better)
  const rankScore = player.fantasyPoints ? player.fantasyPoints / 1000 : 
                    player.baseRank ? 1000 / Math.max(1, player.baseRank) : 0.1;
  
  // 2. Position scarcity bonus
  const positionLimit = DEFAULT_POSITION_LIMITS[player.position] || 2;
  const currentCount = teamNeeds.positionCounts[player.position] || 0;
  const needsPosition = currentCount < positionLimit;
  
  let scarcityBonus = 0;
  if (needsPosition) {
    // Calculate how scarce this position is
    const remainingPicks = (teamNeeds.remainingRounds * 8) - teamNeeds.slot;
    const scarcity = getPositionScarcity(availablePlayers, player.position, remainingPicks);
    scarcityBonus = scarcity * 100; // Scale up scarcity bonus
  } else if (currentCount >= positionLimit) {
    // Penalize if we already have enough of this position
    scarcityBonus = -200;
  }
  
  // 3. ADP adjustment (lower ADP = higher value)
  const adpScore = player.adp ? 500 / Math.max(1, player.adp) : 0.1;
  
  // 4. Positional value adjustments
  const positionValues: Record<string, number> = {
    'QB': 0.8,  // QBs less valuable in college fantasy
    'RB': 1.2,  // RBs more valuable
    'WR': 1.0,  // WRs standard value
    'TE': 0.9,  // TEs slightly less valuable
    'K': 0.3    // Kickers much less valuable
  };
  
  const positionMultiplier = positionValues[player.position] || 1.0;
  
  // 5. Late-round strategy adjustments
  const isLateRound = teamNeeds.remainingRounds <= 3;
  let lateRoundBonus = 0;
  
  if (isLateRound) {
    // In late rounds, prioritize filling roster holes
    const totalPositionsNeeded = Object.entries(DEFAULT_POSITION_LIMITS)
      .reduce((total, [pos, limit]) => {
        const current = teamNeeds.positionCounts[pos] || 0;
        return total + Math.max(0, limit - current);
      }, 0);
    
    if (needsPosition && totalPositionsNeeded > 0) {
      lateRoundBonus = 50; // Bonus for filling needed positions
    }
  }
  
  // 6. Calculate final score with weights
  const finalScore = 
    (strategy.wRank * rankScore * positionMultiplier) +
    (strategy.wScarcity * scarcityBonus) +
    (strategy.wAdp * adpScore) +
    lateRoundBonus +
    (seededRandom() * 10); // Small random component for tie-breaking
  
  return finalScore;
}

/**
 * Find the best available player for a team
 */
export function getBestAvailablePlayer(
  availablePlayers: Player[],
  teamNeeds: TeamNeeds,
  strategy: BotStrategyConfig = DEFAULT_BOT_STRATEGY,
  seed: string = 'default-seed'
): Player | null {
  if (availablePlayers.length === 0) {
    return null;
  }
  
  // Score all available players
  const scoredPlayers = availablePlayers.map(player => ({
    player,
    score: scorePlayer(player, teamNeeds, availablePlayers, strategy, seed)
  }));
  
  // Sort by score (highest first)
  scoredPlayers.sort((a, b) => b.score - a.score);
  
  return scoredPlayers[0].player;
}

/**
 * Calculate team needs based on current roster
 */
export function calculateTeamNeeds(
  slot: number,
  picks: Array<{ slot: number; playerId: string; round: number }>,
  totalRounds: number,
  currentRound: number
): TeamNeeds {
  // Get all picks for this team
  const teamPicks = picks.filter(pick => pick.slot === slot);
  
  // Count positions
  const positionCounts: Record<string, number> = {};
  // Note: We'd need to look up player positions from the picks
  // For now, we'll initialize empty and update as we go
  
  return {
    slot,
    positionCounts,
    totalPicks: teamPicks.length,
    remainingRounds: totalRounds - currentRound + 1
  };
}

/**
 * Get bot strategy for a specific team slot (can vary by team)
 */
export function getBotStrategy(slot: number): BotStrategyConfig {
  // Could vary strategy by team, for now use default
  const strategies: Record<number, BotStrategyConfig> = {
    1: { wRank: 0.7, wScarcity: 0.2, wAdp: 0.1 }, // More rank-focused
    2: { wRank: 0.5, wScarcity: 0.4, wAdp: 0.1 }, // More scarcity-focused
    3: { wRank: 0.6, wScarcity: 0.3, wAdp: 0.1 }, // Balanced
    // ... could define different strategies for each slot
  };
  
  return strategies[slot] || DEFAULT_BOT_STRATEGY;
}