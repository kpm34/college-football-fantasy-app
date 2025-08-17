#!/usr/bin/env npx tsx

/**
 * Mock Draft Concurrency Test - 8 Human Participants Simulation
 * Tests the mock draft engine with concurrent picks, out-of-turn attempts, and autopick scenarios
 */

import fs from 'fs';
import path from 'path';
import { ensureMockDraftSchema } from '../appwrite/ensure-mock-draft-schema';
import { loadEligiblePlayers } from '../../lib/draft/playerPool';

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3002';

interface PickEvent {
  timestamp: string;
  slot: number;
  requestedOverall?: number;
  actualOverall?: number;
  playerId?: string;
  playerName?: string;
  result: 'success' | 'error' | 'autopick' | 'out-of-turn' | 'retry';
  error?: string;
  retryCount?: number;
}

interface ConcurrencyTestResult {
  draftId: string;
  startTime: string;
  endTime: string;
  durationSec: number;
  totalPicks: number;
  manualPicks: number;
  autopicks: number;
  outOfTurnAttempts: number;
  concurrencyRetries: number;
  events: PickEvent[];
  validation: {
    noDuplicatePlayers: boolean;
    correctPickCount: boolean;
    draftComplete: boolean;
  };
}

async function makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.error || data.message || 'Request failed'}`);
  }
  
  return data;
}

async function createHumanDraft(): Promise<string> {
  console.log('🎯 Creating human mock draft...');
  
  const response = await makeRequest('/api/mock-draft/create', {
    method: 'POST',
    body: JSON.stringify({
      draftName: "8-Human Concurrency Test",
      rounds: 15,
      timerPerPickSec: 3, // 3 second timer per pick
      seed: "CONCURRENCY-SEED-001"
    })
  });
  
  console.log(`✅ Draft created: ${response.draftId}`);
  return response.draftId;
}

async function startDraft(draftId: string): Promise<void> {
  console.log('🚀 Starting human draft (without auto-execution)...');
  
  // Use human mode to start without auto-execution
  await makeRequest('/api/mock-draft/start', {
    method: 'POST',
    body: JSON.stringify({ 
      draftId,
      mode: 'human'  // This tells the API to not auto-execute
    })
  });
  
  console.log('✅ Human draft marked as active');
}

async function getDraftStatus(draftId: string): Promise<any> {
  return await makeRequest(`/api/mock-draft/results?draftId=${draftId}`);
}

async function makePick(draftId: string, slot: number, playerId: string): Promise<any> {
  return await makeRequest('/api/mock-draft/pick', {
    method: 'POST',
    body: JSON.stringify({
      draftId,
      slot,
      playerId
    })
  });
}

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

class HumanDraftClient {
  private slot: number;
  private draftId: string;
  private playersPool: any[];
  private events: PickEvent[] = [];
  private picksMade = 0;
  private isActive = true;

  constructor(slot: number, draftId: string, playersPool: any[]) {
    this.slot = slot;
    this.draftId = draftId;
    this.playersPool = playersPool;
  }

  private log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[Client ${this.slot}] ${timestamp}: ${message}`, data || '');
  }

  private addEvent(event: Omit<PickEvent, 'timestamp' | 'slot'>) {
    this.events.push({
      timestamp: new Date().toISOString(),
      slot: this.slot,
      ...event
    });
  }

  async waitForTurn(pickOrder: number[], maxPicks: number): Promise<{ overall: number; round: number } | null> {
    let attempts = 0;
    const maxAttempts = 300; // 5 minutes of polling
    
    while (attempts < maxAttempts && this.isActive) {
      try {
        const status = await getDraftStatus(this.draftId);
        const currentPicks = status.picks?.length || 0;
        
        if (currentPicks >= maxPicks) {
          this.log('Draft completed');
          this.isActive = false;
          return null;
        }

        const nextOverall = currentPicks + 1;
        const expectedSlot = pickOrder[nextOverall - 1];
        
        if (expectedSlot === this.slot) {
          const round = Math.ceil(nextOverall / 8);
          this.log(`My turn! Pick ${nextOverall}, Round ${round}`);
          return { overall: nextOverall, round };
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
        
      } catch (error) {
        this.log(`Error polling status: ${error}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
    }
    
    this.log('Stopped waiting (timeout or draft ended)');
    this.isActive = false;
    return null;
  }

  async attemptPick(overall: number, round: number): Promise<boolean> {
    // 20% chance to skip pick (force autopick)
    if (Math.random() < 0.2) {
      this.log(`Skipping pick ${overall} - will cause autopick`);
      this.addEvent({
        requestedOverall: overall,
        result: 'autopick'
      });
      
      // Wait longer to ensure autopick happens
      await new Promise(resolve => setTimeout(resolve, 4000));
      return false;
    }

    // Random delay (100-1000ms) to simulate human thinking
    const delay = 100 + Math.random() * 900;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Get available players (excluding already picked)
    const status = await getDraftStatus(this.draftId);
    const pickedPlayerIds = new Set((status.picks || []).map((p: any) => p.playerId));
    const availablePlayers = this.playersPool.filter(p => !pickedPlayerIds.has(p.id));
    
    if (availablePlayers.length === 0) {
      this.log('No available players remaining');
      return false;
    }

    // Pick a random available player
    const selectedPlayer = availablePlayers[Math.floor(Math.random() * Math.min(10, availablePlayers.length))];
    
    let retries = 0;
    const maxRetries = 3;
    
    while (retries <= maxRetries) {
      try {
        this.log(`Attempting pick ${overall}: ${selectedPlayer.name} (${selectedPlayer.position})`);
        
        const result = await makePick(this.draftId, this.slot, selectedPlayer.id);
        
        this.log(`✅ Pick successful: ${selectedPlayer.name}`);
        this.addEvent({
          requestedOverall: overall,
          actualOverall: result.pick.overall,
          playerId: selectedPlayer.id,
          playerName: selectedPlayer.name,
          result: 'success',
          retryCount: retries
        });
        
        this.picksMade++;
        return true;
        
      } catch (error: any) {
        this.log(`❌ Pick failed (attempt ${retries + 1}): ${error.message}`);
        
        if (error.message.includes('Not your turn') || error.message.includes('Pick order changed')) {
          this.addEvent({
            requestedOverall: overall,
            result: 'out-of-turn',
            error: error.message,
            retryCount: retries
          });
          
          // If it's not our turn, stop retrying
          return false;
        }
        
        if (error.message.includes('already drafted')) {
          // Player was drafted by someone else, try another player
          this.log('Player already drafted, trying another...');
          const newAvailablePlayers = availablePlayers.filter(p => p.id !== selectedPlayer.id);
          if (newAvailablePlayers.length > 0) {
            const newPlayer = newAvailablePlayers[Math.floor(Math.random() * Math.min(10, newAvailablePlayers.length))];
            selectedPlayer.id = newPlayer.id;
            selectedPlayer.name = newPlayer.name;
            selectedPlayer.position = newPlayer.position;
          }
        }
        
        this.addEvent({
          requestedOverall: overall,
          result: 'retry',
          error: error.message,
          retryCount: retries
        });
        
        retries++;
        
        if (retries <= maxRetries) {
          // Exponential backoff with jitter
          const backoff = Math.min(1000, 100 * Math.pow(2, retries)) + Math.random() * 100;
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }
    
    this.log(`❌ Failed to make pick after ${maxRetries} retries`);
    return false;
  }

  async simulateOutOfTurnPick(currentOverall: number): Promise<void> {
    // Try to pick when it's not our turn (for concurrency testing)
    try {
      const availablePlayers = this.playersPool.slice(0, 10); // Use first 10 players
      const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      
      this.log(`Attempting OUT-OF-TURN pick: ${randomPlayer.name}`);
      await makePick(this.draftId, this.slot, randomPlayer.id);
      
      this.log(`⚠️ OUT-OF-TURN pick succeeded (unexpected!)`);
      
    } catch (error: any) {
      this.log(`✅ OUT-OF-TURN pick blocked: ${error.message}`);
      this.addEvent({
        requestedOverall: currentOverall,
        result: 'out-of-turn',
        error: error.message
      });
    }
  }

  getEvents(): PickEvent[] {
    return this.events;
  }

  getStats() {
    return {
      picksMade: this.picksMade,
      events: this.events.length
    };
  }

  stop() {
    this.isActive = false;
  }
}

async function runConcurrencyTest(): Promise<ConcurrencyTestResult> {
  console.log('🧪 MOCK DRAFT CONCURRENCY TEST');
  console.log('===============================\n');

  const startTime = new Date();
  
  try {
    // 1. Ensure schema
    console.log('1️⃣ Ensuring schema...');
    await ensureMockDraftSchema();
    
    // 2. Load player pool
    console.log('2️⃣ Loading player pool...');
    const playersPool = await loadEligiblePlayers();
    console.log(`   Loaded ${playersPool.length} eligible players`);
    
    // 3. Create draft
    console.log('3️⃣ Creating human draft...');
    const draftId = await createHumanDraft();
    
    // 4. Start draft
    console.log('4️⃣ Starting draft...');
    await startDraft(draftId);
    
    // 5. Create 8 human clients
    console.log('5️⃣ Creating 8 human clients...');
    const clients: HumanDraftClient[] = [];
    for (let slot = 1; slot <= 8; slot++) {
      clients.push(new HumanDraftClient(slot, draftId, playersPool));
    }
    
    // 6. Generate pick order
    const pickOrder = generatePickOrder(8, 15, true);
    const maxPicks = 8 * 15; // 120 total picks
    
    console.log('6️⃣ Starting concurrent client simulation...');
    console.log(`   Target picks: ${maxPicks}`);
    console.log(`   Pick order: [${pickOrder.slice(0, 16).join(', ')}...]`);
    
    // 7. Main simulation loop
    const allEvents: PickEvent[] = [];
    let outOfTurnAttempts = 0;
    let concurrencyRetries = 0;
    
    const simulationPromises = clients.map(async (client, index) => {
      let roundsCompleted = 0;
      
      while (roundsCompleted < 15) {
        try {
          // Wait for turn
          const myTurn = await client.waitForTurn(pickOrder, maxPicks);
          
          if (!myTurn) {
            console.log(`[Client ${client['slot']}] Simulation ended`);
            break;
          }
          
          // Occasionally attempt out-of-turn picks (concurrency test)
          if (Math.random() < 0.1 && myTurn.round > 1) { // 10% chance, not in round 1
            await client.simulateOutOfTurnPick(myTurn.overall);
            outOfTurnAttempts++;
          }
          
          // Make the pick
          const success = await client.attemptPick(myTurn.overall, myTurn.round);
          
          if (success) {
            roundsCompleted++;
          }
          
          // Small break between picks
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.error(`[Client ${client['slot']}] Error:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`[Client ${client['slot']}] Finished - ${client.getStats().picksMade} picks made`);
    });
    
    // Wait for all clients or timeout
    const timeout = new Promise(resolve => setTimeout(resolve, 120000)); // 2 minute timeout
    await Promise.race([Promise.all(simulationPromises), timeout]);
    
    // Stop all clients
    clients.forEach(client => client.stop());
    
    console.log('7️⃣ Collecting final results...');
    
    // Get final draft state
    const finalStatus = await getDraftStatus(draftId);
    
    // Collect all events
    clients.forEach(client => {
      allEvents.push(...client.getEvents());
    });
    
    // Count event types
    allEvents.forEach(event => {
      if (event.result === 'retry') {
        concurrencyRetries++;
      }
    });
    
    const manualPicks = allEvents.filter(e => e.result === 'success').length;
    const autopicks = (finalStatus.picks?.length || 0) - manualPicks;
    
    const endTime = new Date();
    const durationSec = (endTime.getTime() - startTime.getTime()) / 1000;
    
    // Validation
    const pickedPlayers = new Set((finalStatus.picks || []).map((p: any) => p.playerId));
    const noDuplicatePlayers = pickedPlayers.size === (finalStatus.picks?.length || 0);
    const correctPickCount = (finalStatus.picks?.length || 0) === maxPicks;
    const draftComplete = finalStatus.draft.status === 'complete';
    
    const result: ConcurrencyTestResult = {
      draftId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSec,
      totalPicks: finalStatus.picks?.length || 0,
      manualPicks,
      autopicks,
      outOfTurnAttempts,
      concurrencyRetries,
      events: allEvents.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      validation: {
        noDuplicatePlayers,
        correctPickCount,
        draftComplete
      }
    };
    
    return result;
    
  } catch (error) {
    console.error('❌ Concurrency test failed:', error);
    throw error;
  }
}

function printConcurrencyReport(result: ConcurrencyTestResult): void {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 CONCURRENCY TEST RESULTS');
  console.log('='.repeat(60));
  
  console.log(`\n📊 Summary:`);
  console.log(`   Draft ID: ${result.draftId}`);
  console.log(`   Duration: ${result.durationSec.toFixed(2)}s`);
  console.log(`   Total Picks: ${result.totalPicks}/120`);
  console.log(`   Manual Picks: ${result.manualPicks}`);
  console.log(`   Autopicks: ${result.autopicks}`);
  console.log(`   Out-of-turn Attempts: ${result.outOfTurnAttempts}`);
  console.log(`   Concurrency Retries: ${result.concurrencyRetries}`);
  
  console.log(`\n✅ Validation:`);
  console.log(`   No Duplicate Players: ${result.validation.noDuplicatePlayers ? '✅' : '❌'}`);
  console.log(`   Correct Pick Count: ${result.validation.correctPickCount ? '✅' : '❌'}`);
  console.log(`   Draft Complete: ${result.validation.draftComplete ? '✅' : '❌'}`);
  
  console.log(`\n🎯 Event Summary:`);
  const eventCounts = result.events.reduce((counts, event) => {
    counts[event.result] = (counts[event.result] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  Object.entries(eventCounts).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  const allValid = result.validation.noDuplicatePlayers && 
                  result.validation.correctPickCount && 
                  result.validation.draftComplete;
  
  console.log('\n' + '='.repeat(60));
  console.log(allValid ? '✅ ALL VALIDATIONS PASSED!' : '❌ SOME VALIDATIONS FAILED!');
  console.log('='.repeat(60));
}

async function saveConcurrencyResults(result: ConcurrencyTestResult): Promise<string> {
  const tmpDir = path.join(process.cwd(), 'tmp', 'mock-drafts');
  const resultsDir = path.join(tmpDir, result.draftId);
  
  fs.mkdirSync(resultsDir, { recursive: true });
  
  const filePath = path.join(resultsDir, `${result.draftId}-concurrency.json`);
  fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  
  console.log(`💾 Concurrency results saved: ${filePath}`);
  return filePath;
}

async function main(): Promise<void> {
  try {
    const result = await runConcurrencyTest();
    await saveConcurrencyResults(result);
    printConcurrencyReport(result);
    
    // Exit with error code if validation failed
    const allValid = result.validation.noDuplicatePlayers && 
                    result.validation.correctPickCount && 
                    result.validation.draftComplete;
    
    process.exit(allValid ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Concurrency test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { runConcurrencyTest };