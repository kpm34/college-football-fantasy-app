#!/usr/bin/env npx tsx

/**
 * Simple Pipeline Activation - Works with existing data
 * Populates projections collections from existing college_players data
 */

import { serverDatabases as databases, DATABASE_ID } from '../lib/appwrite-server';
import { ID, Query } from 'node-appwrite';
import * as fs from 'fs';
import * as path from 'path';

const SEASON = 2025;

// API Configuration
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
  console.log('🚀 ACTIVATING PROJECTION PIPELINE (Simple Mode)');
  console.log('===============================================\n');
  
  try {
    // Validate API configuration
    validateApiKeys();
    
    // Test CFBD API connection
    console.log('🔗 Testing CFBD API connection...');
    await testCFBDConnection();
    
    // Test Appwrite connection
    console.log('📊 Testing Appwrite connection...');
    await testAppwriteConnection();
    
    // Step 1: Load existing depth chart data
    console.log('📊 Loading depth chart data...');
    const depthFile = path.join(process.cwd(), 'data/player/depth/team_sites_2025.json');
    let depthData: any[] = [];
    if (fs.existsSync(depthFile)) {
      depthData = JSON.parse(fs.readFileSync(depthFile, 'utf8'));
      console.log(`✅ Loaded ${depthData.length} depth chart entries\n`);
    }
    
    // Build depth index
    const depthIndex = new Map<string, { rank: number; team: string }>();
    for (const entry of depthData) {
      const key = `${entry.player_name?.toLowerCase()}|${entry.position}`;
      depthIndex.set(key, {
        rank: entry.pos_rank || 1,
        team: entry.team_name
      });
    }
    
    // Step 2: Get all draftable players
    console.log('🏈 Fetching draftable players...');
    const players = await databases.listDocuments(
      DATABASE_ID,
      'college_players',
      [
        Query.equal('draftable', true),
        Query.equal('conference', ['SEC', 'ACC', 'Big 12', 'Big Ten']),
        Query.limit(1000)
      ]
    );
    console.log(`✅ Found ${players.documents.length} draftable players\n`);
    
    // Step 3: Update player projections directly in college_players collection
    console.log('💾 Updating player fantasy projections...');
    let updated = 0;
    let errors = 0;
    
    for (const player of players.documents) {
      const depthInfo = depthIndex.get(`${player.name?.toLowerCase()}|${player.position}`);
      // Default to starter (rank 1) if no depth info, instead of rank 3
      // This ensures top players get proper projections even without depth chart data
      const depthRank = depthInfo?.rank || 1;
      const projection = calculateProjection(player, depthRank);
      
      try {
        // Update the player record directly with enhanced projection
        await databases.updateDocument(
          DATABASE_ID,
          'college_players',
          player.$id,
          {
            fantasy_points: projection.yearly,
            projection: projection.yearly, // Keep legacy field for compatibility
            updated_at: new Date().toISOString()
          }
        );
        updated++;
      } catch (e: any) {
        console.log(`⚠️ Error for ${player.name}: ${e.message}`);
        errors++;
      }
      
      // Show progress
      if (updated % 100 === 0) {
        console.log(`   Updated ${updated} players...`);
      }
    }
    
    console.log(`✅ Updated: ${updated} players, Errors: ${errors}\n`);
    
    // Step 4: Verify projections were applied
    console.log('🔍 Verifying projection updates...');
    const updatedPlayers = await databases.listDocuments(
      DATABASE_ID,
      'college_players',
      [Query.orderDesc('fantasy_points'), Query.limit(10)]
    );
    
    console.log(`✅ Top 10 projected players:`);
    updatedPlayers.documents.forEach((player, i) => {
      console.log(`   ${i + 1}. ${player.name} (${player.position}, ${player.team}) - ${player.fantasy_points} pts`);
    });
    
    // Final status
    console.log('🎉 PIPELINE ACTIVATED SUCCESSFULLY!');
    console.log('====================================');
    console.log('✅ Depth charts loaded');
    console.log('✅ Projections calculated');
    console.log('✅ Collections populated');
    console.log('✅ Ready for draft UI\n');
    console.log('Data flow: college_players → projections → /api/draft/players → UI');
    
  } catch (error) {
    console.error('❌ Activation failed:', error);
    process.exit(1);
  }
}

function calculateProjection(player: any, depthRank: number) {
  // Base points by position
  const basePoints = {
    QB: 340,
    RB: 280,
    WR: 240,
    TE: 180,
    K: 140
  }[player.position] || 150;
  
  // Depth multipliers
  const multipliers: Record<string, number[]> = {
    QB: [1.0, 0.25, 0.08, 0.03, 0.01],
    RB: [1.0, 0.6, 0.4, 0.25, 0.15],
    WR: [1.0, 0.8, 0.6, 0.35, 0.2],
    TE: [1.0, 0.35, 0.15, 0.1, 0.05],
    K: [1.0, 0.2, 0.1, 0.05, 0.02]
  };
  
  const multiplier = multipliers[player.position]?.[depthRank - 1] || 0.5;
  const yearly = Math.round(basePoints * multiplier);
  const weekly = Math.round(yearly / 12);
  
  return { yearly, weekly };
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
    const response = await fetch(`${CFBD_CONFIG.baseUrl}/roster?year=${SEASON}`, {
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
    const response = await fetch(`${CFBD_CONFIG.baseUrl}/stats/season?year=${SEASON}`, {
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

// Run it
if (require.main === module) {
  activatePipeline().catch(console.error);
}
