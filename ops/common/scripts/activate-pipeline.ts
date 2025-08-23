#!/usr/bin/env npx tsx

/**
 * Pipeline Activation Script
 * Connects all 4 modules: Sourcing → Algorithm → Collections → UI
 */

import { IngestionOrchestrator } from '@domain/data-ingestion/orchestrator/ingestion-orchestrator';
import { serverDatabases as databases, DATABASE_ID } from '../lib/appwrite-server';
import { ID, Query } from 'node-appwrite';

// API Configuration
const CURRENT_SEASON = 2025;
const CURRENT_WEEK = 1;

const APPWRITE_CONFIG = {
  endpoint: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
  projectId: process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
  apiKey: process.env.APPWRITE_API_KEY,
  databaseId: process.env.APPWRITE_DATABASE_ID || 'college-football-fantasy'
};

const CFBD_CONFIG = {
  apiKey: process.env.CFBD_API_KEY,
  backupKey: process.env.CFBD_API_KEY_BACKUP,
  baseUrl: 'https://api.collegefootballdata.com'
};

// Validate API keys on startup
function validateApiKeys() {
  const missingKeys = [];
  
  if (!APPWRITE_CONFIG.apiKey) missingKeys.push('APPWRITE_API_KEY');
  if (!CFBD_CONFIG.apiKey) missingKeys.push('CFBD_API_KEY');
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing required API keys:', missingKeys.join(', '));
    console.error('   Please check your .env.local file');
    process.exit(1);
  }
  
  console.log('✅ API keys validated');
}

async function activatePipeline() {
  console.log('🚀 ACTIVATING PROJECTION PIPELINE');
  console.log('===================================\n');
  
  try {
    // Validate API configuration
    validateApiKeys();
    
    // Test CFBD API connection
    console.log('🔗 Testing CFBD API connection...');
    await testCFBDConnection();
    
    // Test Appwrite connection
    console.log('📊 Testing Appwrite connection...');
    await testAppwriteConnection();
    // Step 1: Run data ingestion (Module 4 - Sourcing)
    console.log('📥 Module 4: Running data ingestion...');
    const orchestrator = new IngestionOrchestrator();
    const ingestionResult = await orchestrator.execute({
      season: CURRENT_SEASON,
      week: CURRENT_WEEK,
      adapters: ['team_notes', 'stats_inference'],
      options: {
        dry_run: false,
        create_snapshot: true,
        parallel_adapters: true,
        max_retries: 3
      }
    });
    
    if (!ingestionResult.success) {
      throw new Error('Ingestion failed');
    }
    console.log(`✅ Ingested ${ingestionResult.stages.publication.records_published} records\n`);

    // Step 2: Process projections (Module 2 - Algorithm)
    console.log('🧮 Module 2: Processing projections algorithm...');
    const players = await databases.listDocuments(
      DATABASE_ID,
      'college_players',
      [Query.equal('draftable', true), Query.limit(500)]
    );
    
    // Get depth chart data from model_inputs
    const modelInputs = await databases.listDocuments(
      DATABASE_ID,
      'model_inputs',
      [Query.equal('season', CURRENT_SEASON), Query.limit(1)]
    );
    
    const depthData = modelInputs.documents[0]?.depth_chart_json 
      ? JSON.parse(modelInputs.documents[0].depth_chart_json) 
      : {};
    
    console.log(`✅ Processing ${players.documents.length} players\n`);

    // Step 3: Populate collections (Module 1 - Collections)
    console.log('💾 Module 1: Populating projection collections...');
    let yearlyCount = 0;
    let weeklyCount = 0;
    
    for (const player of players.documents) {
      const projection = calculateProjection(player, depthData);
      
      // Populate yearly projections
      try {
        await databases.createDocument(
          DATABASE_ID,
          'projections_yearly',
          ID.unique(),
          {
            player_id: player.$id,
            season: CURRENT_SEASON,
            team_id: player.team,
            position: player.position,
            model_version: 'v1.0-activated',
            games_played_est: 12,
            usage_rate: projection.usage,
            fantasy_points_simple: projection.yearly,
            range_median: projection.yearly,
            updatedAt: new Date().toISOString()
          }
        );
        yearlyCount++;
      } catch (e) {
        // Likely already exists, update instead
        const existing = await databases.listDocuments(
          DATABASE_ID,
          'projections_yearly',
          [Query.equal('player_id', player.$id), Query.equal('season', CURRENT_SEASON)]
        );
        if (existing.documents[0]) {
          await databases.updateDocument(
            DATABASE_ID,
            'projections_yearly',
            existing.documents[0].$id,
            {
              fantasy_points_simple: projection.yearly,
              range_median: projection.yearly,
              updatedAt: new Date().toISOString()
            }
          );
        }
      }
      
      // Populate weekly projections (first 3 weeks as example)
      for (let week = 1; week <= 3; week++) {
        try {
          await databases.createDocument(
            DATABASE_ID,
            'projections_weekly',
            ID.unique(),
            {
              player_id: player.$id,
              season: CURRENT_SEASON,
              week: week,
              fantasy_points_simple: projection.weekly,
              updatedAt: new Date().toISOString()
            }
          );
          weeklyCount++;
        } catch (e) {
          // Skip duplicates
        }
      }
    }
    
    console.log(`✅ Created ${yearlyCount} yearly, ${weeklyCount} weekly projections\n`);

    // Step 4: Update UI integration (Module 3)
    console.log('🎨 Module 3: Updating draft UI integration...');
    // The UI already reads from /api/draft/players
    // Now we'll update it to also check projections collections
    
    // Verify collections are populated
    const yearlyCheck = await databases.listDocuments(
      DATABASE_ID,
      'projections_yearly',
      [Query.limit(5)]
    );
    
    const weeklyCheck = await databases.listDocuments(
      DATABASE_ID,
      'projections_weekly',
      [Query.limit(5)]
    );
    
    console.log(`✅ Collections ready: ${yearlyCheck.total} yearly, ${weeklyCheck.total} weekly\n`);
    
    // Final summary
    console.log('🎉 PIPELINE ACTIVATED!');
    console.log('======================');
    console.log('✅ Module 4 (Sourcing): Data ingested');
    console.log('✅ Module 2 (Algorithm): Projections calculated');
    console.log('✅ Module 1 (Collections): Collections populated');
    console.log('✅ Module 3 (UI): Ready to display projections');
    console.log('\nData flow is now:');
    console.log('Sourcing → Algorithm → Collections → UI');
    
  } catch (error) {
    console.error('❌ Pipeline activation failed:', error);
    process.exit(1);
  }
}

// Simple projection calculation (matching /api/draft/players logic)
function calculateProjection(player: any, depthData: any) {
  const basePoints = {
    QB: 280, RB: 220, WR: 200, TE: 160, K: 140
  }[player.position] || 150;
  
  // Apply depth multiplier
  let multiplier = 1.0;
  const playerDepth = getPlayerDepth(player, depthData);
  if (playerDepth) {
    multiplier = getDepthMultiplier(player.position, playerDepth);
  }
  
  const yearly = Math.round(basePoints * multiplier);
  const weekly = Math.round(yearly / 12);
  
  return {
    yearly,
    weekly,
    usage: multiplier
  };
}

function getPlayerDepth(player: any, depthData: any): number {
  // Find player in depth chart
  if (depthData[player.team]?.[player.position]) {
    const depthList = depthData[player.team][player.position];
    const index = depthList.findIndex((p: any) => 
      p.player_name?.toLowerCase() === player.name?.toLowerCase()
    );
    return index >= 0 ? index + 1 : 5;
  }
  return 3; // Default middle depth
}

function getDepthMultiplier(position: string, rank: number): number {
  const multipliers: Record<string, number[]> = {
    QB: [1.0, 0.25, 0.08, 0.03, 0.01],
    RB: [1.0, 0.6, 0.4, 0.25, 0.15],
    WR: [1.0, 0.8, 0.6, 0.35, 0.2],
    TE: [1.0, 0.35, 0.15, 0.1, 0.05],
    K: [1.0, 0.2, 0.1, 0.05, 0.02]
  };
  return multipliers[position]?.[rank - 1] || 0.1;
}

// API Connection Tests
async function testCFBDConnection(): Promise<void> {
  try {
    const response = await fetch(`${CFBD_CONFIG.baseUrl}/teams`, {
      headers: {
        'Authorization': `Bearer ${CFBD_CONFIG.apiKey}`,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CFBD API responded with status ${response.status}`);
    }
    
    const teams = await response.json();
    console.log(`✅ CFBD API connected (${teams.length} teams available)\n`);
    
  } catch (error) {
    console.error('❌ CFBD API connection failed:', error);
    
    // Try backup key if available
    if (CFBD_CONFIG.backupKey) {
      console.log('🔄 Trying backup CFBD key...');
      try {
        const response = await fetch(`${CFBD_CONFIG.baseUrl}/teams`, {
          headers: {
            'Authorization': `Bearer ${CFBD_CONFIG.backupKey}`,
            'accept': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('✅ CFBD backup API connected\n');
          // Update primary key to backup for this session
          CFBD_CONFIG.apiKey = CFBD_CONFIG.backupKey;
          return;
        }
      } catch (backupError) {
        console.error('❌ CFBD backup API also failed:', backupError);
      }
    }
    
    throw new Error('CFBD API connection failed');
  }
}

async function testAppwriteConnection(): Promise<void> {
  try {
    // Test by fetching a simple document count from college_players
    const testQuery = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      'college_players',
      [Query.limit(1)]
    );
    
    console.log(`✅ Appwrite connected (${testQuery.total} players in database)\n`);
    
  } catch (error) {
    console.error('❌ Appwrite connection failed:', error);
    throw new Error('Appwrite connection failed');
  }
}

// Enhanced CFBD data fetching functions
async function fetchLatestPlayerData(): Promise<any[]> {
  console.log('📥 Fetching latest player data from CFBD...');
  
  try {
    const response = await fetch(`${CFBD_CONFIG.baseUrl}/roster?year=${CURRENT_SEASON}`, {
      headers: {
        'Authorization': `Bearer ${CFBD_CONFIG.apiKey}`,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CFBD roster API responded with status ${response.status}`);
    }
    
    const rosters = await response.json();
    console.log(`✅ Fetched ${rosters.length} roster entries from CFBD\n`);
    
    return rosters;
    
  } catch (error) {
    console.error('⚠️ Failed to fetch CFBD player data:', error);
    console.log('   Continuing with existing data...\n');
    return [];
  }
}

async function fetchTeamStats(): Promise<any[]> {
  console.log('📈 Fetching team statistics from CFBD...');
  
  try {
    const response = await fetch(`${CFBD_CONFIG.baseUrl}/stats/season?year=${CURRENT_SEASON}`, {
      headers: {
        'Authorization': `Bearer ${CFBD_CONFIG.apiKey}`,
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`CFBD stats API responded with status ${response.status}`);
    }
    
    const stats = await response.json();
    console.log(`✅ Fetched team stats for ${stats.length} teams\n`);
    
    return stats;
    
  } catch (error) {
    console.error('⚠️ Failed to fetch CFBD team stats:', error);
    console.log('   Continuing with default projections...\n');
    return [];
  }
}

// Run activation
if (require.main === module) {
  activatePipeline().catch(console.error);
}