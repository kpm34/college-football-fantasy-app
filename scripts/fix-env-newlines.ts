#!/usr/bin/env tsx

import { execSync } from 'child_process';

const envVarsToFix = [
  'NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_USERS',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS',
  'NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS',
];

const expectedValues = {
  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES: 'leagues',
  NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS: 'teams',
  NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES: 'games',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS: 'college_players',
  NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS: 'rankings',
  NEXT_PUBLIC_APPWRITE_COLLECTION_USERS: 'users',
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS: 'rosters',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS: 'player_stats',
};

console.log('🔧 Fixing environment variables with trailing newlines...\n');

// First remove the old values
for (const varName of envVarsToFix) {
  try {
    console.log(`Removing old ${varName}...`);
    execSync(`vercel env rm ${varName} production -y`, { stdio: 'pipe' });
    execSync(`vercel env rm ${varName} preview -y`, { stdio: 'pipe' });
    execSync(`vercel env rm ${varName} development -y`, { stdio: 'pipe' });
  } catch (e) {
    // Ignore if doesn't exist
  }
}

console.log('\n📤 Adding clean environment variables...\n');

// Add clean values
for (const [varName, value] of Object.entries(expectedValues)) {
  console.log(`Setting ${varName}=${value}`);
  
  try {
    // Use echo to ensure clean value without newlines
    execSync(`echo -n '${value}' | vercel env add ${varName} production`, { stdio: 'pipe' });
    execSync(`echo -n '${value}' | vercel env add ${varName} preview`, { stdio: 'pipe' });
    execSync(`echo -n '${value}' | vercel env add ${varName} development`, { stdio: 'pipe' });
  } catch (e) {
    console.error(`Failed to set ${varName}:`, e.message);
  }
}

console.log('\n✅ Environment variables fixed! Run "vercel env pull .env.local" to update local.');

