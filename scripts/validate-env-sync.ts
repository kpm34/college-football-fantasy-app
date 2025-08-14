#!/usr/bin/env tsx

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// This is a lightweight validation script that can run during builds

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production', override: false });
dotenv.config({ path: '.env', override: false });

// Expected collection mappings
const COLLECTION_MAPPINGS = {
  NEXT_PUBLIC_APPWRITE_COLLECTION_LEAGUES: 'leagues',
  NEXT_PUBLIC_APPWRITE_COLLECTION_TEAMS: 'teams', 
  NEXT_PUBLIC_APPWRITE_COLLECTION_DRAFTED_PLAYERS: 'rosters',
  NEXT_PUBLIC_APPWRITE_COLLECTION_MATCHUPS: 'matchups', // Appwrite uses 'matchups', not 'lineups'
  NEXT_PUBLIC_APPWRITE_COLLECTION_GAMES: 'games',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS: 'college_players',
  NEXT_PUBLIC_APPWRITE_COLLECTION_RANKINGS: 'rankings',
  NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYER_STATS: 'player_stats',
  NEXT_PUBLIC_APPWRITE_COLLECTION_USERS: 'users',
  NEXT_PUBLIC_APPWRITE_COLLECTION_AUCTIONS: 'auction_sessions', // Appwrite uses 'auction_sessions'
  NEXT_PUBLIC_APPWRITE_COLLECTION_BIDS: 'auction_bids', // Appwrite uses 'auction_bids'
};

function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required base env vars
  const requiredVars = [
    'APPWRITE_API_KEY',
    'NEXT_PUBLIC_APPWRITE_ENDPOINT',
    'NEXT_PUBLIC_APPWRITE_PROJECT_ID',
    'NEXT_PUBLIC_APPWRITE_DATABASE_ID'
  ];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  
  // Check collection env vars
  for (const [envKey, expectedValue] of Object.entries(COLLECTION_MAPPINGS)) {
    const actualValue = process.env[envKey];
    
    if (!actualValue) {
      errors.push(`Missing collection env var: ${envKey}`);
    } else if (actualValue !== expectedValue) {
      errors.push(`Incorrect value for ${envKey}: expected "${expectedValue}" but got "${actualValue}"`);
    }
  }
  
  // Check if lib/appwrite.ts COLLECTIONS object matches
  const appwriteTsPath = path.join(process.cwd(), 'lib', 'appwrite.ts');
  if (fs.existsSync(appwriteTsPath)) {
    const content = fs.readFileSync(appwriteTsPath, 'utf-8');
    
    // Check for hardcoded values that should use env vars
    if (content.includes("PLAYERS: 'players'") || content.includes('PLAYERS: "players"')) {
      errors.push('lib/appwrite.ts has hardcoded "players" instead of "college_players"');
    }
    
    if (content.includes("ROSTERS: 'teams'") || content.includes('ROSTERS: "teams"')) {
      errors.push('lib/appwrite.ts has incorrect ROSTERS mapping');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate .env.example file
function generateEnvExample() {
  const envExample = `# Appwrite Configuration
APPWRITE_API_KEY=your-api-key-here
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=college-football-fantasy-app
NEXT_PUBLIC_APPWRITE_DATABASE_ID=college-football-fantasy

# Collection IDs - DO NOT CHANGE THESE VALUES
${Object.entries(COLLECTION_MAPPINGS).map(([key, value]) => `${key}=${value}`).join('\n')}

# API Keys
CFBD_API_KEY=your-cfbd-api-key
AI_GATEWAY_API_KEY=your-ai-gateway-key
ROTOWIRE_API_KEY=your-rotowire-key
ODDS_API_KEY=your-odds-api-key

# Feature Flags
EDGE_CONFIG=your-edge-config-id

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
`;
  
  fs.writeFileSync('.env.example', envExample);
  console.log('✅ Generated .env.example file');
}

// Main validation
console.log('🔍 Validating environment configuration...\n');

const { isValid, errors } = validateEnvironment();

if (!isValid) {
  console.error('❌ Environment validation failed!\n');
  errors.forEach(error => console.error(`  - ${error}`));
  console.error('\nRun "npm run sync:env" to fix these issues.');
  process.exit(1);
} else {
  console.log('✅ Environment configuration is valid!');
  
  // Generate .env.example
  generateEnvExample();
  
  console.log('\n📋 Current collection mappings:');
  Object.entries(COLLECTION_MAPPINGS).forEach(([key, value]) => {
    const actualValue = process.env[key];
    console.log(`  ${key.replace('NEXT_PUBLIC_APPWRITE_COLLECTION_', '')} → ${actualValue || value}`);
  });
}
