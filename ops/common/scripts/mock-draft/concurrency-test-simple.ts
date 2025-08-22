#!/usr/bin/env npx tsx

/**
 * Simple Mock Draft Concurrency Test - Focused validation
 * Tests basic concurrency scenarios without complex autopick logic
 */

import fs from 'fs';
import path from 'path';
import { ensureMockDraftSchema } from '../appwrite/ensure-mock-draft-schema';
import { loadEligiblePlayers } from '../../lib/draft/playerPool';

const BASE_URL = 'http://localhost:3003';

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
    throw new Error(`HTTP ${response.status}: ${data.error || 'Request failed'}`);
  }
  
  return data;
}

async function simpleConcurrencyTest(): Promise<void> {
  console.log('🧪 SIMPLE CONCURRENCY TEST');
  console.log('===========================\n');

  try {
    // 1. Setup
    console.log('1️⃣ Setting up...');
    await ensureMockDraftSchema();
    const players = await loadEligiblePlayers();
    console.log(`   Loaded ${players.length} players`);
    
    // 2. Create draft
    console.log('2️⃣ Creating draft...');
    const createResponse = await makeRequest('/api/mock-draft/create', {
      method: 'POST',
      body: JSON.stringify({
        draftName: "Simple Concurrency Test",
        rounds: 2, // Only 2 rounds for quick test
        timerPerPickSec: 5,
        seed: "SIMPLE-TEST-001"
      })
    });
    const draftId = createResponse.draftId;
    console.log(`   Draft ID: ${draftId}`);
    
    // 3. Start in human mode
    console.log('3️⃣ Starting human draft...');
    await makeRequest('/api/mock-draft/start', {
      method: 'POST',
      body: JSON.stringify({ 
        draftId,
        mode: 'human'
      })
    });
    console.log('   ✅ Draft active');
    
    // 4. Test concurrent picks
    console.log('4️⃣ Testing concurrency scenarios...');
    
    // Test 1: Valid pick by slot 1
    console.log('   Test 1: Valid pick by slot 1');
    try {
      const result = await makeRequest('/api/mock-draft/pick', {
        method: 'POST',
        body: JSON.stringify({
          draftId,
          slot: 1,
          playerId: players[0].id
        })
      });
      console.log(`   ✅ Pick 1 success: ${players[0].name}`);
    } catch (error) {
      console.log(`   ❌ Pick 1 failed: ${error}`);
    }
    
    // Test 2: Out-of-turn pick attempt by slot 1 (should fail)
    console.log('   Test 2: Out-of-turn pick by slot 1 (should fail)');
    try {
      await makeRequest('/api/mock-draft/pick', {
        method: 'POST',
        body: JSON.stringify({
          draftId,
          slot: 1,
          playerId: players[1].id
        })
      });
      console.log(`   ❌ Out-of-turn pick succeeded (unexpected!)`);
    } catch (error) {
      console.log(`   ✅ Out-of-turn pick blocked: ${error.message}`);
    }
    
    // Test 3: Valid pick by slot 2
    console.log('   Test 3: Valid pick by slot 2');
    try {
      const result = await makeRequest('/api/mock-draft/pick', {
        method: 'POST',
        body: JSON.stringify({
          draftId,
          slot: 2,
          playerId: players[1].id
        })
      });
      console.log(`   ✅ Pick 2 success: ${players[1].name}`);
    } catch (error) {
      console.log(`   ❌ Pick 2 failed: ${error}`);
    }
    
    // Test 4: Duplicate player pick (should fail)
    console.log('   Test 4: Duplicate player pick (should fail)');
    try {
      await makeRequest('/api/mock-draft/pick', {
        method: 'POST',
        body: JSON.stringify({
          draftId,
          slot: 3,
          playerId: players[0].id // Same as first pick
        })
      });
      console.log(`   ❌ Duplicate pick succeeded (unexpected!)`);
    } catch (error) {
      console.log(`   ✅ Duplicate pick blocked: ${error.message}`);
    }
    
    // Test 5: Concurrent picks by multiple slots
    console.log('   Test 5: Concurrent picks simulation');
    const concurrentPromises = [];
    
    for (let slot = 3; slot <= 6; slot++) {
      const promise = (async () => {
        // Random delay to simulate human thinking
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        try {
          const result = await makeRequest('/api/mock-draft/pick', {
            method: 'POST',
            body: JSON.stringify({
              draftId,
              slot,
              playerId: players[slot + 10].id // Use different players
            })
          });
          return { slot, success: true, player: players[slot + 10].name };
        } catch (error) {
          return { slot, success: false, error: error.message };
        }
      })();
      
      concurrentPromises.push(promise);
    }
    
    const concurrentResults = await Promise.all(concurrentPromises);
    concurrentResults.forEach(result => {
      if (result.success) {
        console.log(`   ✅ Slot ${result.slot}: ${result.player}`);
      } else {
        console.log(`   ❌ Slot ${result.slot}: ${result.error}`);
      }
    });
    
    // 5. Final validation
    console.log('5️⃣ Final validation...');
    const finalStatus = await makeRequest(`/api/mock-draft/results?draftId=${draftId}`);
    const pickCount = finalStatus.picks?.length || 0;
    const uniquePlayers = new Set((finalStatus.picks || []).map((p: any) => p.playerId));
    
    console.log(`   Total picks: ${pickCount}`);
    console.log(`   Unique players: ${uniquePlayers.size}`);
    console.log(`   No duplicates: ${uniquePlayers.size === pickCount ? '✅' : '❌'}`);
    
    // Save results
    const tmpDir = path.join(process.cwd(), 'tmp', 'mock-drafts', draftId);
    fs.mkdirSync(tmpDir, { recursive: true });
    
    const resultPath = path.join(tmpDir, `${draftId}-simple-concurrency.json`);
    fs.writeFileSync(resultPath, JSON.stringify({
      draftId,
      totalPicks: pickCount,
      uniquePlayers: uniquePlayers.size,
      noDuplicates: uniquePlayers.size === pickCount,
      concurrentResults,
      finalStatus
    }, null, 2));
    
    console.log(`\n💾 Results saved: ${resultPath}`);
    console.log('\n✅ Simple concurrency test completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  simpleConcurrencyTest().catch(console.error);
}

export { simpleConcurrencyTest };