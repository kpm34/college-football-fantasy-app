/**
 * In-Memory Mock Draft Engine - No database storage required
 * Mock drafts are practice sessions that don't need persistence
 */

import { DraftConfig, DraftParticipant, DraftPick, Player, TeamNeeds, UserType } from './types';
import { loadEligiblePlayers, filterAvailablePlayers } from './playerPool';
import { getBestAvailablePlayer, getBotStrategy } from './ranker';

// In-memory storage for active mock drafts
const activeMockDrafts = new Map<string, MockDraftSession>();

interface MockDraftSession {
  id: string;
  name: string;
  config: DraftConfig;
  participants: DraftParticipant[];
  picks: DraftPick[];
  status: 'pending' | 'active' | 'complete' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  numTeams: number;
  rounds: number;
}

/**
 * Generate a unique draft ID
 */
function generateDraftId(): string {
  return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new in-memory mock draft
 */
export async function createMockDraft(
  draftName: string,
  config: DraftConfig,
  participants?: Array<{ slot: number; userType: UserType; displayName: string; client_id?: string }>,
  numTeams: number = 8
): Promise<string> {
  try {
    console.log(`🎯 Creating in-memory mock draft: ${draftName} (${numTeams} teams)`);
    
    const draftId = generateDraftId();
    
    // Create participants (use provided or default to bots for numTeams)
    const participantsList: DraftParticipant[] = [];
    const participantsToCreate = participants || Array.from({ length: numTeams }, (_, i) => ({
      slot: i + 1,
      userType: 'bot' as UserType,
      displayName: `Bot Team ${i + 1}`
    }));

    for (const p of participantsToCreate) {
      participantsList.push({
        id: `participant_${draftId}_${p.slot}`,
        draftId,
        userType: p.userType,
        displayName: p.displayName,
        slot: p.slot,
        userId: p.client_id
      });
    }

    // Create mock draft session
    const session: MockDraftSession = {
      id: draftId,
      name: draftName,
      config: {
        ...config,
        seed: config.seed || `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      participants: participantsList,
      picks: [],
      status: 'pending',
      numTeams,
      rounds: config.rounds
    };

    // Store in memory
    activeMockDrafts.set(draftId, session);

    console.log(`✅ Mock draft created with ID: ${draftId}`);
    console.log(`✅ Created ${participantsList.length} participants (${participantsToCreate.filter(p => p.userType === 'human').length} human, ${participantsToCreate.filter(p => p.userType === 'bot').length} bot)`);
    
    return draftId;
    
  } catch (error: any) {
    console.error('❌ Failed to create mock draft:', error);
    throw new Error(`Failed to create mock draft: ${error.message}`);
  }
}

/**
 * Start and execute a mock draft with all bot picks
 */
export async function startMockDraft(draftId: string): Promise<void> {
  try {
    console.log(`🚀 Starting mock draft: ${draftId}`);
    
    const session = activeMockDrafts.get(draftId);
    if (!session) {
      throw new Error('Mock draft not found');
    }

    // Update status to active
    session.status = 'active';
    session.startedAt = new Date();

    console.log(`👥 Found ${session.participants.length} participants`);

    // Load eligible players
    const allPlayers = await loadEligiblePlayers();
    console.log(`📊 Loaded ${allPlayers.length} eligible players`);
    
    // Generate pick order
    const pickOrder = generatePickOrder(session.numTeams, session.rounds, session.config.snake || true);
    console.log(`📋 Generated pick order for ${pickOrder.length} total picks`);
    
    const startTime = Date.now();
    const pickedPlayerIds = new Set<string>();
    
    // Execute each pick
    for (let overall = 1; overall <= pickOrder.length; overall++) {
      const slot = pickOrder[overall - 1];
      const round = Math.ceil(overall / session.numTeams);
      const participant = session.participants.find(p => p.slot === slot);
      
      if (!participant) {
        throw new Error(`No participant found for slot ${slot}`);
      }
      
      console.log(`\n🔄 Pick ${overall}: Round ${round}, Slot ${slot} (${participant.displayName})`);
      
      // Get available players
      const availablePlayers = filterAvailablePlayers(allPlayers, pickedPlayerIds);
      
      if (availablePlayers.length === 0) {
        throw new Error('No available players remaining');
      }
      
      // Calculate team needs based on previous picks
      const teamPicks = session.picks.filter(pick => pick.slot === slot);
      const teamNeeds: TeamNeeds = {
        slot,
        positionCounts: teamPicks.reduce((counts, pick) => {
          const player = allPlayers.find(p => p.id === pick.playerId);
          if (player) {
            counts[player.position] = (counts[player.position] || 0) + 1;
          }
          return counts;
        }, {} as Record<string, number>),
        totalPicks: teamPicks.length,
        remainingRounds: session.rounds - round + 1
      };
      
      // Get bot strategy for this team
      const strategy = getBotStrategy(slot);
      
      // Find best available player
      const selectedPlayer = getBestAvailablePlayer(
        availablePlayers,
        teamNeeds,
        strategy,
        session.config.seed || 'default'
      );
      
      if (!selectedPlayer) {
        throw new Error('Could not select a player');
      }
      
      console.log(`✅ Selected: ${selectedPlayer.name} (${selectedPlayer.position}, ${selectedPlayer.team})`);
      
      // Create the pick
      const pick: DraftPick = {
        id: `pick_${draftId}_${overall}`,
        draftId,
        round,
        overall,
        slot,
        participantId: participant.id,
        playerId: selectedPlayer.id,
        pickedAt: new Date(),
        autopick: true
      };
      
      // Store the pick
      session.picks.push(pick);
      pickedPlayerIds.add(selectedPlayer.id);
      
      // Small delay to simulate real draft timing
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const endTime = Date.now();
    const durationSec = (endTime - startTime) / 1000;
    
    console.log(`\n🏁 Mock draft completed in ${durationSec.toFixed(2)} seconds`);
    
    // Update session status to complete
    session.status = 'complete';
    session.completedAt = new Date();
    
    console.log('✅ Mock draft completed successfully!');
    
  } catch (error) {
    console.error('❌ Mock draft failed:', error);
    
    // Update session status to failed
    const session = activeMockDrafts.get(draftId);
    if (session) {
      session.status = 'failed';
    }
    
    throw error;
  }
}

/**
 * Get mock draft results
 */
export async function getMockDraftResults(draftId: string): Promise<any> {
  try {
    const session = activeMockDrafts.get(draftId);
    if (!session) {
      throw new Error('Mock draft not found');
    }
    
    // Load all players to get details
    const allPlayers = await loadEligiblePlayers();
    const playerMap = new Map(allPlayers.map(p => [p.id, p]));
    
    // Build summary by team
    const summaryByTeam = session.participants.map(participant => {
      const teamPicks = session.picks.filter(pick => pick.slot === participant.slot);
      
      const players = teamPicks.map(pick => {
        const player = playerMap.get(pick.playerId);
        return {
          name: player?.name || 'Unknown',
          position: player?.position || 'Unknown',
          team: player?.team || 'Unknown',
          overall: pick.overall,
          round: pick.round
        };
      });
      
      // Count positions
      const positionCounts = players.reduce((counts, player) => {
        counts[player.position] = (counts[player.position] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      return {
        slot: participant.slot,
        displayName: participant.displayName,
        players,
        positionCounts,
        totalPlayers: players.length
      };
    });
    
    return {
      draft: {
        id: session.id,
        name: session.name,
        status: session.status,
        numTeams: session.numTeams,
        rounds: session.rounds,
        startedAt: session.startedAt,
        completedAt: session.completedAt
      },
      participants: session.participants,
      picks: session.picks,
      summaryByTeam
    };
    
  } catch (error) {
    console.error('❌ Failed to get mock draft results:', error);
    throw new Error('Failed to get mock draft results');
  }
}

/**
 * Generate snake draft order for all rounds
 */
function generatePickOrder(numTeams: number, rounds: number, snake: boolean): number[] {
  const order: number[] = [];
  
  for (let round = 1; round <= rounds; round++) {
    if (snake && round % 2 === 0) {
      // Even rounds go in reverse order (8, 7, 6, ..., 1)
      for (let slot = numTeams; slot >= 1; slot--) {
        order.push(slot);
      }
    } else {
      // Odd rounds go in normal order (1, 2, 3, ..., 8)
      for (let slot = 1; slot <= numTeams; slot++) {
        order.push(slot);
      }
    }
  }
  
  return order;
}

/**
 * Clean up old mock drafts (optional - for memory management)
 */
export function cleanupOldMockDrafts(olderThanHours: number = 2): void {
  const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
  
  for (const [draftId, session] of activeMockDrafts.entries()) {
    const sessionTime = session.startedAt?.getTime() || session.completedAt?.getTime() || Date.now();
    if (sessionTime < cutoff) {
      activeMockDrafts.delete(draftId);
      console.log(`🧹 Cleaned up old mock draft: ${draftId}`);
    }
  }
}

/**
 * Get all active mock drafts (for debugging)
 */
export function getActiveMockDrafts(): string[] {
  return Array.from(activeMockDrafts.keys());
}