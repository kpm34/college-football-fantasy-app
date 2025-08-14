#!/usr/bin/env tsx

import { Client, Databases } from 'node-appwrite';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

// Expected collection mappings
const EXPECTED_COLLECTIONS = {
  LEAGUES: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES', dbName: 'leagues' },
  TEAMS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS', dbName: 'teams' },
  ROSTERS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS', dbName: 'rosters' },
  LINEUPS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS', dbName: 'matchups' }, // Note: DB has 'matchups', not 'lineups'
  GAMES: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES', dbName: 'games' },
  PLAYERS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS', dbName: 'college_players' },
  RANKINGS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS', dbName: 'rankings' },
  PLAYER_STATS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS', dbName: 'player_stats' },
  USERS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_USERS', dbName: 'users' },
  AUCTIONS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS', dbName: 'auction_sessions' }, // Note: DB has 'auction_sessions'
  BIDS: { envKey: 'NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS', dbName: 'auction_bids' }, // Note: DB has 'auction_bids'
};

interface SyncReport {
  vercelEnv: Record<string, string>;
  localEnv: Record<string, string>;
  appwriteCollections: string[];
  mismatches: Array<{
    type: 'missing_env' | 'wrong_value' | 'missing_collection';
    key: string;
    expected?: string;
    actual?: string;
  }>;
  recommendations: string[];
}

async function pullVercelEnv(): Promise<Record<string, string>> {
  console.log('📥 Pulling Vercel environment variables...');
  
  try {
    // Pull env vars to a temporary file
    const tempFile = '.env.vercel-temp';
    execSync(`vercel env pull ${tempFile}`, { stdio: 'pipe' });
    
    // Read and parse the file
    const envContent = fs.readFileSync(tempFile, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && key.includes('COLLECTION')) {
        envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    });
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
    return envVars;
  } catch (error) {
    console.error('Failed to pull Vercel env:', error);
    return {};
  }
}

async function getAppwriteCollections(): Promise<string[]> {
  console.log('🔍 Fetching Appwrite collections...');
  
  try {
    const response = await databases.listCollections(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy'
    );
    
    return response.collections.map(col => col.$id);
  } catch (error) {
    console.error('Failed to fetch Appwrite collections:', error);
    return [];
  }
}

async function getLocalEnv(): Promise<Record<string, string>> {
  const envVars: Record<string, string> = {};
  
  // Get from process.env (already loaded)
  Object.keys(process.env).forEach(key => {
    if (key.includes('COLLECTION')) {
      envVars[key] = process.env[key] || '';
    }
  });
  
  return envVars;
}

async function generateSyncReport(): Promise<SyncReport> {
  const [vercelEnv, localEnv, appwriteCollections] = await Promise.all([
    pullVercelEnv(),
    getLocalEnv(),
    getAppwriteCollections()
  ]);
  
  const report: SyncReport = {
    vercelEnv,
    localEnv,
    appwriteCollections,
    mismatches: [],
    recommendations: []
  };
  
  // Check each expected collection
  for (const [key, config] of Object.entries(EXPECTED_COLLECTIONS)) {
    const { envKey, dbName } = config;
    
    // Check if env var exists in Vercel
    if (!vercelEnv[envKey]) {
      report.mismatches.push({
        type: 'missing_env',
        key: envKey,
        expected: dbName
      });
      report.recommendations.push(`Add ${envKey}="${dbName}" to Vercel environment`);
    } else if (vercelEnv[envKey] !== dbName) {
      report.mismatches.push({
        type: 'wrong_value',
        key: envKey,
        expected: dbName,
        actual: vercelEnv[envKey]
      });
      report.recommendations.push(`Update ${envKey} from "${vercelEnv[envKey]}" to "${dbName}" in Vercel`);
    }
    
    // Check if collection exists in Appwrite
    if (!appwriteCollections.includes(dbName)) {
      report.mismatches.push({
        type: 'missing_collection',
        key: dbName
      });
      report.recommendations.push(`Create collection "${dbName}" in Appwrite`);
    }
  }
  
  return report;
}

async function updateVercelEnv(key: string, value: string) {
  try {
    console.log(`📤 Updating Vercel env: ${key}=${value}`);
    execSync(`vercel env add ${key} production`, {
      input: value,
      stdio: 'pipe'
    });
    execSync(`vercel env add ${key} preview`, {
      input: value,
      stdio: 'pipe'
    });
    execSync(`vercel env add ${key} development`, {
      input: value,
      stdio: 'pipe'
    });
  } catch (error) {
    console.error(`Failed to update ${key}:`, error);
  }
}

async function syncAll(autoFix: boolean = false) {
  console.log('🔄 Starting environment and collections sync...\n');
  
  const report = await generateSyncReport();
  
  // Display report
  console.log('📊 Sync Report:');
  console.log('================\n');
  
  console.log('✅ Vercel Environment Variables:');
  Object.entries(report.vercelEnv).forEach(([key, value]) => {
    console.log(`  ${key} = "${value}"`);
  });
  
  console.log('\n📁 Appwrite Collections:');
  report.appwriteCollections.forEach(col => {
    console.log(`  - ${col}`);
  });
  
  if (report.mismatches.length > 0) {
    console.log('\n❌ Mismatches Found:');
    report.mismatches.forEach(mismatch => {
      if (mismatch.type === 'missing_env') {
        console.log(`  - Missing env var: ${mismatch.key} (should be "${mismatch.expected}")`);
      } else if (mismatch.type === 'wrong_value') {
        console.log(`  - Wrong value: ${mismatch.key} is "${mismatch.actual}" but should be "${mismatch.expected}"`);
      } else if (mismatch.type === 'missing_collection') {
        console.log(`  - Missing Appwrite collection: ${mismatch.key}`);
      }
    });
    
    console.log('\n🔧 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
    
    if (autoFix) {
      console.log('\n🔧 Auto-fixing issues...');
      
      for (const mismatch of report.mismatches) {
        if (mismatch.type === 'missing_env' || mismatch.type === 'wrong_value') {
          if (mismatch.expected) {
            await updateVercelEnv(mismatch.key, mismatch.expected);
          }
        }
      }
      
      console.log('\n✅ Auto-fix complete! Run "vercel env pull .env.local" to update local env.');
    }
  } else {
    console.log('\n✅ Everything is in sync!');
  }
  
  // Generate updated COLLECTIONS constant
  console.log('\n📝 Updated COLLECTIONS object for lib/appwrite.ts:');
  console.log('```typescript');
  console.log('export const COLLECTIONS = {');
  Object.entries(EXPECTED_COLLECTIONS).forEach(([key, config]) => {
    console.log(`  ${key}: process.env.${config.envKey} || '${config.dbName}',`);
  });
  console.log('};');
  console.log('```');
}

// Parse command line arguments
const args = process.argv.slice(2);
const autoFix = args.includes('--fix') || args.includes('-f');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: tsx scripts/sync-env-and-collections.ts [options]

Options:
  --fix, -f     Automatically fix mismatches by updating Vercel env vars
  --help, -h    Show this help message

This script will:
1. Pull environment variables from Vercel
2. Check what collections exist in Appwrite
3. Compare against expected configuration
4. Report any mismatches
5. Optionally fix issues automatically
`);
  process.exit(0);
}

// Run sync
syncAll(autoFix).catch(console.error);
