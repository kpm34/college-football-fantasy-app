/**
 * Player Pool Loader for Mock Draft
 */

import { serverDatabases as databases, DATABASE_ID } from '../appwrite-server';
import { Query } from 'node-appwrite';
import { Player } from './types';

export async function loadEligiblePlayers(): Promise<Player[]> {
  try {
    console.log('📊 Loading eligible players for draft...');
    
    // Load players from college_players collection
    const playersResponse = await databases.listDocuments(
      DATABASE_ID,
      'college_players',
      [
        // Use new availability flag
        Query.equal('eligible', true),
        Query.equal('conference', ['SEC', 'ACC', 'Big 12', 'Big Ten']),
        Query.equal('position', ['QB', 'RB', 'WR', 'TE', 'K']),
        Query.orderDesc('fantasyPoints'),
        Query.limit(1000) // Get top 1000 players for draft
      ]
    );

    // Load rankings for base ranking (optional)
    const rankingsMap: Map<string, number> = new Map();
    try {
      const rankingsResponse = await databases.listDocuments(
        DATABASE_ID,
        'rankings',
        [
          Query.equal('season', 2025),
          Query.orderAsc('rank'),
          Query.limit(100)
        ]
      );
      
      rankingsResponse.documents.forEach((ranking: any, index: number) => {
        // Use ranking as a base rank for teams
        rankingsMap.set(ranking.team, ranking.rank || (index + 1));
      });
    } catch (error) {
      console.warn('⚠️ Could not load rankings, using fallback ranking');
    }

    const players: Player[] = playersResponse.documents.map((player: any, index: number) => {
      // Calculate base rank from fantasyPoints and position
      let baseRank = index + 1; // Use fantasyPoints ordering as primary rank
      
      // Adjust for team ranking if available
      const teamRank = rankingsMap.get(player.team);
      if (teamRank && teamRank <= 25) {
        // Boost players from ranked teams
        baseRank = Math.max(1, baseRank - (26 - teamRank));
      }
      
      // Calculate rough ADP based on position and rank
      const positionMultipliers: Record<string, number> = {
        'QB': 1.3, // QBs go later in college fantasy
        'RB': 0.9, // RBs go earlier
        'WR': 1.0, // WRs are standard
        'TE': 1.4, // TEs go later
        'K': 2.0   // Kickers go very late
      };
      
      const adp = Math.round(baseRank * (positionMultipliers[player.position] || 1.2));

      return {
        id: player.$id,
        name: player.name || 'Unknown Player',
        position: player.position || 'RB',
        team: player.team || 'Unknown Team',
        baseRank,
        adp,
        fantasyPoints: player.fantasyPoints || 0
      };
    });

    console.log(`✅ Loaded ${players.length} eligible players`);
    
    // Log some stats
    const positionCounts = players.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 Position distribution:', positionCounts);
    console.log(`🏆 Top 5 players:`, players.slice(0, 5).map(p => `${p.name} (${p.position}, ${p.team})`));
    
    const missingRankCount = players.filter(p => !p.baseRank || p.baseRank >= 9999).length;
    if (missingRankCount > 0) {
      console.warn(`⚠️ ${missingRankCount} players missing base rankings`);
    }

    return players;
    
  } catch (error) {
    console.error('❌ Failed to load eligible players:', error);
    throw new Error('Failed to load player pool');
  }
}

export function filterAvailablePlayers(
  allPlayers: Player[], 
  pickedPlayerIds: Set<string>
): Player[] {
  return allPlayers.filter(player => !pickedPlayerIds.has(player.id));
}

export function getPositionScarcity(
  availablePlayers: Player[], 
  position: string,
  remainingPicks: number
): number {
  const positionPlayers = availablePlayers.filter(p => p.position === position);
  if (positionPlayers.length === 0) return 0;
  
  // Scarcity increases as fewer players remain relative to remaining picks
  const scarcityRatio = remainingPicks / positionPlayers.length;
  return Math.min(2.0, Math.max(0.1, scarcityRatio));
}