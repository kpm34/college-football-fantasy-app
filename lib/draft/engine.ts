/**
 * Mock Draft Engine - Core draft execution logic
 */

import { serverDatabases as databases, DATABASE_ID } from '../appwrite-server';
import { ID, Query } from 'node-appwrite';
import { DraftConfig, MockDraft, DraftParticipant, DraftPick, Player, TeamNeeds, TurnState, UserType } from './types';
import { loadEligiblePlayers, filterAvailablePlayers } from './playerPool';
import { getBestAvailablePlayer, getBotStrategy, calculateTeamNeeds } from './ranker';
import { COLLECTIONS } from '@schema/zod-schema';

/**
 * Generate a random seed if none provided
 */
function generateSeed(): string {
  return `DRAFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new mock draft with bot or human participants
 */
export async function createDraft(
  draftName: string,
  config: DraftConfig,
  participants?: Array<{ slot: number; userType: UserType; displayName: string; clientId?: string }>,
  numTeams: number = 8
): Promise<string> {
  try {
    console.log(`🎯 Creating draft: ${draftName} (${numTeams} teams)`);
    
    // Generate seed if not provided
    const seed = config.seed || generateSeed();
    
    // Create the mock draft document using existing Appwrite schema
    let draft;
    try {
      draft = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        ID.unique(),
        {
          leagueId: config.leagueId || 'mock-draft', // Prefer real league when provided
          status: 'active',
          type: 'mock', // Mark as mock draft type
          currentRound: 1,
          currentPick: 1,
          maxRounds: config.rounds,
          startTime: new Date().toISOString(),
          isMock: true,
          clockSeconds: config.timerPerPickSec || 0,
          // Store draft metadata in orderJson field
          orderJson: JSON.stringify({
            draftName: draftName,
            numTeams,
            snake: config.snake || true,
            seed,
            timerPerPickSec: config.timerPerPickSec,
            positionLimits: config.positionLimits,
            rosterLimits: config.rosterLimits
          })
        }
      );
    } catch (e: any) {
      console.error('Error creating draft document:', e);
      throw e;
    }

    console.log(`✅ Draft created with ID: ${draft.$id}`);

    // Create participants (use provided or default to bots for numTeams)
    const participantsList: DraftParticipant[] = [];
    const participantsToCreate = (participants as any[]) || Array.from({ length: numTeams }, (_, i) => ({
      slot: i + 1,
      userType: 'bot' as UserType,
      displayName: `Bot Team ${i + 1}`
    }));

    for (const p of participantsToCreate) {
      try {
        // Store participant data in payloadJson field since draft_events doesn't have userType/displayName fields
        const participantData = {
          userType: p.userType,
          displayName: p.displayName,
          slot: p.slot,
          clientId: p.clientId || null
        };
        
        const participant = await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.DRAFT_EVENTS,
          ID.unique(),
          {
            draftId: draft.$id,
            type: 'participant', // Mark as participant type
            overall: p.slot, // Use overall field to store slot number
            payloadJson: JSON.stringify(participantData),
            ts: new Date().toISOString()
          }
        );
        
        // Add parsed data back to the participant object for easy access
        Object.assign(participant, participantData);
        participantsList.push(participant as any);
      } catch (e: any) {
        console.error(`Failed to create participant ${p.slot}:`, e);
        throw e;
      }
    }

    console.log(`✅ Created ${participantsList.length} participants (${participantsToCreate.filter(p => p.userType === 'human').length} human, ${participantsToCreate.filter(p => p.userType === 'bot').length} bot)`);
    
    return draft.$id;
    
  } catch (error: any) {
    console.error('❌ Failed to create draft:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      type: error.type,
      response: error.response
    });
    throw new Error(`Failed to create draft: ${error.message}`);
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
 * Start and execute the draft
 */
export async function startDraft(draftId: string): Promise<void> {
  try {
    console.log(`🚀 Starting draft: ${draftId}`);
    
    // Get draft details
    const draft = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId);
    const config = draft.config ? JSON.parse(draft.config) : {};
    
    // Update status to active
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MOCK_DRAFTS,
      draftId,
      {
        status: 'active',
        startedAt: new Date().toISOString()
      }
    );

    // Get participants
    const participantsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_EVENTS,
      [Query.equal('draftId', draftId), Query.equal('type', 'participant'), Query.orderAsc('overall')]
    );
    
    // Parse participant data from payload_json
    const participants = participantsResponse.documents.map((doc: any) => {
      if (doc.payloadJson) {
        const data = JSON.parse(doc.payloadJson);
        return { ...doc, ...data };
      }
      return doc;
    });
    console.log(`👥 Found ${participants.length} participants`);

    // Load eligible players
    const allPlayers = await loadEligiblePlayers();
    console.log(`📊 Loaded ${allPlayers.length} eligible players`);
    
    // Generate pick order
    const pickOrder = generatePickOrder(draft.numTeams, draft.rounds, draft.snake);
    console.log(`📋 Generated pick order for ${pickOrder.length} total picks`);
    
    const startTime = Date.now();
    const pickedPlayerIds = new Set<string>();
    const picks: DraftPick[] = [];
    
    // Execute each pick
    for (let overall = 1; overall <= pickOrder.length; overall++) {
      const slot = pickOrder[overall - 1];
      const round = Math.ceil(overall / draft.numTeams);
      const participant = participants.find((p: any) => p.slot === slot);
      
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
      const teamPicks = picks.filter(pick => pick.slot === slot);
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
        remainingRounds: draft.rounds - round + 1
      };
      
      // Get bot strategy for this team
      const strategy = getBotStrategy(slot);
      
      // Find best available player
      const selectedPlayer = getBestAvailablePlayer(
        availablePlayers,
        teamNeeds,
        strategy,
        config.seed || 'default'
      );
      
      if (!selectedPlayer) {
        throw new Error('Could not select a player');
      }
      
      console.log(`✅ Selected: ${selectedPlayer.name} (${selectedPlayer.position}, ${selectedPlayer.team})`);
      
      // Check for optimistic concurrency
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          // Verify this is still the expected pick number
          const existingPicks = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.DRAFT_EVENTS,
            [Query.equal('draftId', draftId), Query.equal('type', 'pick'), Query.orderAsc('overall')]
          );
          
          if (existingPicks.total !== overall - 1) {
            console.warn(`⚠️ Concurrency issue detected. Expected ${overall - 1} picks, found ${existingPicks.total}`);
            retries++;
            await new Promise(resolve => setTimeout(resolve, 100));
            continue;
          }
          
          // Create the pick
          const pickData = {
            round,
            overall,
            slot,
            participantId: participant.$id,
            playerId: selectedPlayer.id,
            pickedAt: new Date().toISOString(),
            autopick: true,
            playerName: selectedPlayer.name,
            position: selectedPlayer.position,
            team: selectedPlayer.team
          };
          
          const pick = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.DRAFT_EVENTS,
            ID.unique(),
            {
              draftId: draftId,
              type: 'pick',
              round,
              overall,
              playerId: selectedPlayer.id,
              payloadJson: JSON.stringify(pickData),
              ts: new Date().toISOString()
            }
          );
          
          // Track the pick locally
          picks.push(pick as any);
          pickedPlayerIds.add(selectedPlayer.id);
          
          break; // Success, exit retry loop
          
        } catch (error: any) {
          if (error.message?.includes('unique constraint') || error.message?.includes('already exists')) {
            retries++;
            console.warn(`⚠️ Retry ${retries}/${maxRetries} due to unique constraint violation`);
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            throw error;
          }
        }
      }
      
      if (retries >= maxRetries) {
        throw new Error('Failed to create pick after multiple retries');
      }
      
      // Small delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const endTime = Date.now();
    const durationSec = (endTime - startTime) / 1000;
    
    console.log(`\n🏁 Draft completed in ${durationSec.toFixed(2)} seconds`);
    
    // Update draft status to complete
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.MOCK_DRAFTS,
      draftId,
      {
        status: 'complete',
        completedAt: new Date().toISOString(),
        config: JSON.stringify({
          ...config,
          metrics: {
            durationSec,
            totalPicks: picks.length,
            autopicksCount: picks.length // All picks are autopicks
          }
        })
      }
    );
    
    console.log('✅ Draft completed successfully!');
    
  } catch (error) {
    console.error('❌ Draft failed:', error);
    
    // Update draft status to failed
    try {
      const draft = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId);
      const config = draft.config ? JSON.parse(draft.config) : {};
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        draftId,
        {
          status: 'failed',
          config: JSON.stringify({
            ...config,
            lastError: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      );
    } catch (updateError) {
      console.error('❌ Failed to update draft status to failed:', updateError);
    }
    
    throw error;
  }
}

/**
 * Get draft results with full details
 */
export async function getDraftResults(draftId: string): Promise<any> {
  try {
    // Get draft
    const draft = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId);
    // Parse config - for mock drafts it's in orderJson
    let config = {};
    if (draft.orderJson && typeof draft.orderJson === 'string') {
      try {
        config = JSON.parse(draft.orderJson);
      } catch (e) {
        console.error('Error parsing orderJson:', e);
      }
    } else if (draft.config && typeof draft.config === 'string') {
      try {
        config = JSON.parse(draft.config);
      } catch (e) {
        console.error('Error parsing config:', e);
      }
    }
    draft.config = config;
    
    // Get participants
    const participantsResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_EVENTS,
      [Query.equal('draftId', draftId), Query.equal('type', 'participant'), Query.orderAsc('overall')]
    );
    
    // Get picks (ensure we get all picks, not just default limit)
    const picksResponse = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.DRAFT_EVENTS,
      [
        Query.equal('draftId', draftId),
        Query.equal('type', 'pick'), 
        Query.orderAsc('overall'),
        Query.limit(500) // Increase limit to ensure we get all picks
      ]
    );
    
    // Load all players to get details
    const allPlayers = await loadEligiblePlayers();
    const playerMap = new Map(allPlayers.map(p => [p.id, p]));
    
    // Parse participant data from payload_json
    const participants = participantsResponse.documents.map((doc: any) => {
      if (doc.payloadJson) {
        const data = JSON.parse(doc.payloadJson);
        return { ...doc, ...data };
      }
      return doc;
    });
    
    // Parse pick data from payload_json
    const picks = picksResponse.documents.map((doc: any) => {
      if (doc.payloadJson) {
        const data = JSON.parse(doc.payloadJson);
        return { ...doc, ...data };
      }
      return doc;
    });
    
    // Build summary by team
    const summaryByTeam = participants.map((participant: any) => {
      const teamPicks = picks.filter((pick: any) => pick.slot === participant.slot);
      
      const players = teamPicks.map((pick: any) => {
        const player = playerMap.get(pick.playerId || pick.playerId);
        return {
          name: pick.playerName || player?.name || 'Unknown',
          position: pick.position || player?.position || 'Unknown',
          team: pick.team || player?.team || 'Unknown',
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
      draft,
      participants: participantsResponse.documents,
      picks: picksResponse.documents,
      summaryByTeam
    };
    
  } catch (error) {
    console.error('❌ Failed to get draft results:', error);
    throw new Error('Failed to get draft results');
  }
}

/**
 * Helper functions for human mode drafts
 */

function computeSlotFor(overall: number, numTeams: number): { round: number; slot: number } {
  const round = Math.ceil(overall / numTeams);
  const idxInRound = (overall - 1) % numTeams; // 0..numTeams-1
  const slot = (round % 2 === 1) ? idxInRound + 1 : (numTeams - idxInRound);
  return { round, slot };
}

async function getDraftDoc(draftId: string) {
  const d = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId);
  // For mock drafts, config is stored in orderJson
  let cfg = {};
  if (d.orderJson && typeof d.orderJson === 'string') {
    try {
      cfg = JSON.parse(d.orderJson);
    } catch (e) {
      console.error('Error parsing orderJson:', e);
    }
  } else if (d.config && typeof d.config === 'string') {
    // Fallback to old config field if it exists
    try {
      cfg = JSON.parse(d.config);
    } catch (e) {
      console.error('Error parsing config:', e);
    }
  }
  return { d, cfg };
}

export async function getTurn(draftId: string): Promise<TurnState> {
  const { d, cfg } = await getDraftDoc(draftId);

  // Ensure startTime is stable and persisted; avoid recomputing from Date.now()
  let startedAtDate: Date;
  if (d.startTime) {
    startedAtDate = new Date(d.startTime);
  } else if (d.startedAt) {
    // Fallback to old field name
    startedAtDate = new Date(d.startedAt);
  } else {
    const now = new Date();
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.DRAFTS,
        draftId,
        {
          startTime: now.toISOString(),
          // If still waiting, flip to active so timers/autopick behave
          status: d.status === 'waiting' ? 'active' : d.status,
        }
      );
    } catch {}
    startedAtDate = now;
  }

  const picks = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, [
    Query.equal('draftId', draftId),
    Query.equal('type', 'pick'),
    Query.orderAsc('overall'),
    Query.limit(500)
  ]);
  const count = picks.total; // overall just made
  const nextOverall = count + 1;
  const numTeams = d.numTeams ?? 8;
  const { round, slot } = computeSlotFor(nextOverall, numTeams);

  const parts = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, [
    Query.equal('draftId', draftId),
    Query.equal('type', 'participant'),
    Query.equal('overall', slot), // slot is stored in overall field for participants
    Query.limit(1)
  ]);
  const participantDoc = parts.documents[0];
  // Parse participant data from payload_json
  const participant = participantDoc ? {
    ...participantDoc,
    ...(participantDoc.payloadJson ? JSON.parse(participantDoc.payloadJson) : {})
  } : null;
  if (!participant) throw new Error('Participant not found for slot');

  const lastPickAt = cfg.lastPickAt ? new Date(cfg.lastPickAt) : startedAtDate;
  const deadline = new Date(lastPickAt.getTime() + (cfg.timerPerPickSec ?? 30) * 1000);

  return {
    draftId,
    overall: nextOverall,
    round,
    slot,
    participantId: participant.$id,
    deadlineAt: deadline.toISOString(),
  };
}

async function selectBestAvailablePlayer(draftId: string, seed: string | undefined) {
  // Uses your existing playerPool + ranker; falls back to first available
  const picked = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, [
    Query.equal('draftId', draftId),
    Query.equal('type', 'pick'),
    Query.select(['playerId']),
    Query.limit(500)
  ]);
  const taken = new Set(picked.documents.map(p => p.playerId));

  // Use existing player pool
  const allPlayers = await loadEligiblePlayers();
  const availablePlayers = filterAvailablePlayers(allPlayers, taken);

  if (!availablePlayers.length) throw new Error('No available players');
  
  // Use existing ranker logic for autopick
  const teamNeeds: TeamNeeds = {
    slot: 1,
    positionCounts: {},
    totalPicks: 0,
    remainingRounds: 1
  };
  
  const strategy = getBotStrategy(1);
  const bestPlayer = getBestAvailablePlayer(availablePlayers, teamNeeds, strategy, seed || 'autopick');
  
  return bestPlayer?.id || availablePlayers[0].id;
}

export async function applyPick(draftId: string, participantId: string, playerId: string, nowIso?: string) {
  const now = nowIso ? new Date(nowIso) : new Date();
  const { d, cfg } = await getDraftDoc(draftId);

  // Validate whose turn it is
  const turn = await getTurn(draftId);
  if (turn.participantId !== participantId) {
    const err: any = new Error('Not your turn');
    err.status = 400;
    throw err;
  }

  // Prevent duplicate player
  const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, [
    Query.equal('draftId', draftId),
    Query.equal('type', 'pick'),
    Query.equal('playerId', playerId),
    Query.limit(1)
  ]);
  if (existing.total > 0) {
    const err: any = new Error('Player already drafted');
    err.status = 400;
    throw err;
  }

  // Write pick with overall = current count + 1
  const pickData = {
    round: turn.round,
    overall: turn.overall,
    slot: turn.slot,
    participantId,
    playerId,
    autopick: false,
    pickedAt: now.toISOString(),
  };
  
  await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, ID.unique(), {
    draftId: draftId,
    type: 'pick',
    round: turn.round,
    overall: turn.overall,
    playerId: playerId,
    payloadJson: JSON.stringify(pickData),
    ts: now.toISOString()
  });

  // Update lastPickAt in order_json for mock drafts
  const nextCfg = { ...cfg, lastPickAt: now.toISOString() };
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId, {
    orderJson: JSON.stringify(nextCfg),
    currentPick: turn.overall + 1,
    currentRound: turn.round
  });

  // If final pick, flip status
  const totalPicks = (d.rounds ?? 15) * (d.numTeams ?? 8);
  if (turn.overall >= totalPicks) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId, {
      status: 'complete',
      completedAt: now.toISOString(),
      config: JSON.stringify(nextCfg),
    });
  }
}

export async function autopickIfExpired(draftId: string, nowIso?: string) {
  const now = nowIso ? new Date(nowIso) : new Date();
  const { d, cfg } = await getDraftDoc(draftId);
  if (d.status !== 'active') return null;

  const turn = await getTurn(draftId);
  const deadline = new Date(turn.deadlineAt);
  if (now <= deadline) return null;

  // Check participant type (using userType from existing schema)
  const part = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, turn.participantId);
  if ((part as any).userType !== 'human') return null; // Only autopick for human players

  const playerId = await selectBestAvailablePlayer(draftId, cfg.seed);
  await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, ID.unique(), {
    draftId,
    round: turn.round,
    overall: turn.overall,
    slot: turn.slot,
    participantId: turn.participantId,
    playerId,
    autopick: true,
    pickedAt: now.toISOString(),
  });

  const metrics = { autopicksCount: (cfg?.metrics?.autopicksCount ?? 0) + 1 };
  const nextCfg = { ...cfg, lastPickAt: now.toISOString(), metrics: { ...(cfg.metrics || {}), ...metrics } };
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId, {
    config: JSON.stringify(nextCfg),
  });

  // If final pick, complete
  const totalPicks = (d.rounds ?? 15) * (d.numTeams ?? 8);
  if (turn.overall >= totalPicks) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId, {
      status: 'complete',
      completedAt: now.toISOString(),
      config: JSON.stringify(nextCfg),
    });
  }
  return { autopicked: true, playerId };
}

/**
 * Autopick immediately if the current participant is a bot.
 * Returns true if a pick was made, false otherwise.
 */
export async function autopickBotIfOnClock(draftId: string, nowIso?: string): Promise<boolean> {
  const now = nowIso ? new Date(nowIso) : new Date();
  const { d, cfg } = await getDraftDoc(draftId);
  if (d.status !== 'active') return false;

  const turn = await getTurn(draftId);
  // Load participant to check userType
  const part = await databases.getDocument(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, turn.participantId);
  if ((part as any).userType !== 'bot') return false;

  // Rate-limit bot picks to at most one every 5 seconds
  const lastBotAutoAt = cfg.lastBotAutoAt ? new Date(cfg.lastBotAutoAt).getTime() : 0;
  if (now.getTime() - lastBotAutoAt < 5000) {
    return false;
  }

  const playerId = await selectBestAvailablePlayer(draftId, cfg.seed);
  await databases.createDocument(DATABASE_ID, COLLECTIONS.DRAFT_EVENTS, ID.unique(), {
    draftId,
    round: turn.round,
    overall: turn.overall,
    slot: turn.slot,
    participantId: turn.participantId,
    playerId,
    autopick: true,
    pickedAt: now.toISOString(),
  });

  const metrics = { autopicksCount: (cfg?.metrics?.autopicksCount ?? 0) + 1 };
  const nextCfg = { ...cfg, lastPickAt: now.toISOString(), lastBotAutoAt: now.toISOString(), metrics: { ...(cfg.metrics || {}), ...metrics } };
  await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId, {
    config: JSON.stringify(nextCfg),
  });

  // Complete if this was the last pick
  const totalPicks = (d.rounds ?? 15) * (d.numTeams ?? 8);
  if (turn.overall >= totalPicks) {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.DRAFTS, draftId, {
      status: 'complete',
      completedAt: now.toISOString(),
      config: JSON.stringify(nextCfg),
    });
  }
  return true;
}