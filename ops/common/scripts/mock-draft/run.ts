#!/usr/bin/env npx tsx

/**
 * Mock Draft Test Harness - End-to-End Bot Draft Execution
 */

import fs from 'fs';
import path from 'path';
import { ensureMockDraftSchema } from '../appwrite/ensure-mock-draft-schema';

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3002';

interface DraftResults {
  success: boolean;
  draft: {
    $id: string;
    draftName: string;
    status: string;
    startedAt?: string;
    completedAt?: string;
    config?: {
      seed?: string;
      metrics?: {
        durationSec?: number;
        totalPicks?: number;
        autopicksCount?: number;
      };
    };
  };
  participants: Array<{
    $id: string;
    slot: number;
    displayName: string;
  }>;
  picks: Array<{
    round: number;
    overall: number;
    slot: number;
    playerId: string;
    pickedAt: string;
  }>;
  summaryByTeam: Array<{
    slot: number;
    displayName: string;
    players: Array<{
      name: string;
      position: string;
      team: string;
      overall: number;
      round: number;
    }>;
    positionCounts: Record<string, number>;
    totalPlayers: number;
  }>;
}

async function makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`🌐 ${options.method || 'GET'} ${url}`);
  
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

async function createMockDraft(): Promise<string> {
  console.log('🎯 Creating mock draft...');
  
  const response = await makeRequest('/api/mock-draft/create', {
    method: 'POST',
    body: JSON.stringify({
      draftName: "E2E Bot Draft",
      rounds: 15,
      timerPerPickSec: 0,
      seed: "BOT-SEED-001"
    })
  });
  
  console.log(`✅ Draft created: ${response.draftId}`);
  return response.draftId;
}

async function startMockDraft(draftId: string): Promise<void> {
  console.log('🚀 Starting mock draft execution...');
  
  const startTime = Date.now();
  
  await makeRequest('/api/mock-draft/start', {
    method: 'POST',
    body: JSON.stringify({ draftId })
  });
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`✅ Draft completed in ${duration.toFixed(2)} seconds`);
}

async function pollForResults(draftId: string, timeoutSec: number = 60): Promise<DraftResults> {
  console.log('📊 Polling for draft results...');
  
  const startTime = Date.now();
  const timeoutMs = timeoutSec * 1000;
  
  while (Date.now() - startTime < timeoutMs) {
    try {
      const results = await makeRequest(`/api/mock-draft/results?draftId=${draftId}`);
      
      if (results.draft.status === 'complete') {
        console.log('✅ Draft completed successfully!');
        return results;
      } else if (results.draft.status === 'failed') {
        throw new Error(`Draft failed: ${results.draft.config?.lastError || 'Unknown error'}`);
      } else {
        console.log(`⏳ Draft status: ${results.draft.status}, waiting...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    } catch (error) {
      console.log(`⚠️ Polling error: ${error}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error(`Timeout after ${timeoutSec} seconds waiting for draft completion`);
}

function generateSummary(results: DraftResults): string {
  const { draft, summaryByTeam, picks } = results;
  const metrics = draft.config?.metrics;
  
  let summary = `
# Mock Draft Results - ${draft.draftName}

## Draft Information
- **Draft ID**: ${draft.$id}
- **Status**: ${draft.status}
- **Seed**: ${draft.config?.seed || 'N/A'}
- **Started**: ${draft.startedAt ? new Date(draft.startedAt).toLocaleString() : 'N/A'}
- **Completed**: ${draft.completedAt ? new Date(draft.completedAt).toLocaleString() : 'N/A'}
- **Duration**: ${metrics?.durationSec ? `${metrics.durationSec.toFixed(2)}s` : 'N/A'}
- **Total Picks**: ${metrics?.totalPicks || picks.length}

## Top 10 Overall Picks
${picks.slice(0, 10).map((pick, index) => {
  const team = summaryByTeam.find(t => t.slot === pick.slot);
  const player = team?.players.find(p => p.overall === pick.overall);
  return `${index + 1}. **${player?.name || 'Unknown'}** (${player?.position}, ${player?.team}) - ${team?.displayName}`;
}).join('\n')}

## Team Rosters

${summaryByTeam.map(team => `
### ${team.displayName} (Slot ${team.slot})
**Players**: ${team.totalPlayers} | **Positions**: ${Object.entries(team.positionCounts)
  .map(([pos, count]) => `${pos}:${count}`)
  .join(', ')}

${team.players.map((player, index) => 
  `${index + 1}. **${player.name}** (${player.position}, ${player.team}) - Round ${player.round}, Pick ${player.overall}`
).join('\n')}
`).join('\n')}

## Position Distribution Summary
${Object.entries(
  summaryByTeam.reduce((totals, team) => {
    Object.entries(team.positionCounts).forEach(([pos, count]) => {
      totals[pos] = (totals[pos] || 0) + count;
    });
    return totals;
  }, {} as Record<string, number>)
).map(([pos, count]) => `- **${pos}**: ${count} players`).join('\n')}

---
Generated: ${new Date().toLocaleString()}
`;

  return summary.trim();
}

async function saveArtifacts(results: DraftResults): Promise<{ jsonPath: string; csvDir: string }> {
  const draftId = results.draft.$id;
  const tmpDir = path.join(process.cwd(), 'tmp', 'mock-drafts');
  const draftDir = path.join(tmpDir, draftId);
  
  // Ensure directories exist
  fs.mkdirSync(draftDir, { recursive: true });
  
  // Save full JSON results
  const jsonPath = path.join(draftDir, `${draftId}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  console.log(`💾 Saved JSON results: ${jsonPath}`);
  
  // Save CSV files per team
  results.summaryByTeam.forEach(team => {
    const csvPath = path.join(draftDir, `team_${team.slot}.csv`);
    const csvHeader = 'Round,Overall,Position,Name,Team,College\n';
    const csvRows = team.players.map(player => 
      `${player.round},${player.overall},${player.position},"${player.name}","${player.team}","${player.team}"`
    ).join('\n');
    
    fs.writeFileSync(csvPath, csvHeader + csvRows);
  });
  
  // Save summary report
  const summaryPath = path.join(draftDir, 'SUMMARY.md');
  const summary = generateSummary(results);
  fs.writeFileSync(summaryPath, summary);
  console.log(`📋 Saved summary report: ${summaryPath}`);
  
  return { jsonPath, csvDir: draftDir };
}

function printConsoleReport(results: DraftResults, artifacts: { jsonPath: string; csvDir: string }): void {
  const { draft, summaryByTeam, picks } = results;
  const metrics = draft.config?.metrics;
  
  console.log('\n' + '='.repeat(60));
  console.log('🏆 MOCK DRAFT COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  
  console.log(`\n📊 Draft Summary:`);
  console.log(`   Draft Name: ${draft.draftName}`);
  console.log(`   Draft ID: ${draft.$id}`);
  console.log(`   Seed: ${draft.config?.seed || 'N/A'}`);
  console.log(`   Duration: ${metrics?.durationSec ? `${metrics.durationSec.toFixed(2)}s` : 'N/A'}`);
  console.log(`   Total Picks: ${metrics?.totalPicks || picks.length}`);
  
  console.log(`\n🏆 Top 10 Overall Picks:`);
  picks.slice(0, 10).forEach((pick, index) => {
    const team = summaryByTeam.find(t => t.slot === pick.slot);
    const player = team?.players.find(p => p.overall === pick.overall);
    console.log(`   ${index + 1}. ${player?.name || 'Unknown'} (${player?.position}, ${player?.team}) - ${team?.displayName}`);
  });
  
  console.log(`\n👥 Team Summary:`);
  summaryByTeam.forEach(team => {
    const positions = Object.entries(team.positionCounts)
      .map(([pos, count]) => `${pos}:${count}`)
      .join(', ');
    console.log(`   ${team.displayName}: ${team.totalPlayers} players (${positions})`);
  });
  
  console.log(`\n📁 Artifacts Saved:`);
  console.log(`   JSON: ${artifacts.jsonPath}`);
  console.log(`   CSV Directory: ${artifacts.csvDir}`);
  console.log(`   Summary Report: ${artifacts.csvDir}/SUMMARY.md`);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Mock Draft Test Harness Completed Successfully!');
  console.log('='.repeat(60));
}

async function runMockDraftTest(): Promise<void> {
  console.log('🎯 MOCK DRAFT TEST HARNESS');
  console.log('==========================\n');
  
  try {
    // 1. Ensure schema exists
    console.log('1️⃣ Ensuring mock draft schema...');
    await ensureMockDraftSchema();
    
    // 2. Create draft
    console.log('\n2️⃣ Creating mock draft...');
    const draftId = await createMockDraft();
    
    // 3. Start draft (this completes the entire draft)
    console.log('\n3️⃣ Starting draft execution...');
    await startMockDraft(draftId);
    
    // 4. Get results
    console.log('\n4️⃣ Getting final results...');
    const results = await makeRequest(`/api/mock-draft/results?draftId=${draftId}`);
    
    if (!results.success) {
      throw new Error('Failed to get draft results');
    }
    
    // 5. Save artifacts
    console.log('\n5️⃣ Saving artifacts...');
    const artifacts = await saveArtifacts(results);
    
    // 6. Print final report
    console.log('\n6️⃣ Final Report:');
    printConsoleReport(results, artifacts);
    
  } catch (error) {
    console.error('\n❌ Mock Draft Test Failed:', error);
    console.error('\nStack trace:');
    if (error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMockDraftTest().catch(console.error);
}

export { runMockDraftTest };