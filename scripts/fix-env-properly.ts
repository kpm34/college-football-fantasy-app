#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';

const envVars = {
  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES: 'leagues',
  NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS: 'teams',
  NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES: 'games',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS: 'college_players',
  NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS: 'rankings',
  NEXT_PUBLIC_APPWRITE_COLLECTION_USERS: 'users',
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS: 'rosters',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS: 'player_stats',
  NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS: 'matchups',
  NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS: 'auction_sessions',
  NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS: 'auction_bids',
};

console.log('🔧 Fixing environment variables properly...\n');

// First, remove all the broken values
console.log('🗑️  Removing broken environment variables...');
for (const varName of Object.keys(envVars)) {
  try {
    execSync(`vercel env rm ${varName} production -y`, { stdio: 'pipe' });
    execSync(`vercel env rm ${varName} preview -y`, { stdio: 'pipe' });
    execSync(`vercel env rm ${varName} development -y`, { stdio: 'pipe' });
  } catch (e) {
    // Ignore if doesn't exist
  }
}

console.log('\n📤 Adding correct environment variables...\n');

// Create a temporary file approach
const tempFile = '.env.temp-fix';

for (const [varName, value] of Object.entries(envVars)) {
  console.log(`Setting ${varName}=${value}`);
  
  // Write the value to a temp file without newline
  fs.writeFileSync(tempFile, value);
  
  try {
    // Use the temp file as input
    execSync(`vercel env add ${varName} production < ${tempFile}`, { stdio: 'pipe' });
    execSync(`vercel env add ${varName} preview < ${tempFile}`, { stdio: 'pipe' });
    execSync(`vercel env add ${varName} development < ${tempFile}`, { stdio: 'pipe' });
  } catch (e) {
    console.error(`Failed to set ${varName}:`, e.message);
  }
}

// Clean up temp file
fs.unlinkSync(tempFile);

console.log('\n✅ Environment variables fixed properly!');

