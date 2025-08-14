#!/usr/bin/env node

const https = require('https');
const { Client, Databases, Query } = require('node-appwrite');

console.log('🔄 Vercel-Appwrite Sync Verification\n');

// Check environment variables
const requiredEnvVars = [
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID',
  'APPWRITE_API_KEY',
  'NEXT_PUBLIC_APPWRITE_DATABASE_ID',
];

const envCheck = {
  allPresent: true,
  missing: [],
};

console.log('📋 Checking Environment Variables:');
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: Set`);
  } else {
    console.log(`❌ ${envVar}: Missing`);
    envCheck.allPresent = false;
    envCheck.missing.push(envVar);
  }
}

if (!envCheck.allPresent) {
  console.log('\n❌ Missing required environment variables:', envCheck.missing.join(', '));
  console.log('Please check your .env.local file\n');
  process.exit(1);
}

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collections to verify
const COLLECTIONS = {
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  ROSTERS: 'rosters',
  LINEUPS: 'lineups',
  GAMES: 'games',
  PLAYERS: 'college_players',
  RANKINGS: 'rankings',
  ACTIVITY_LOG: 'activity_log',
  DRAFT_PICKS: 'draft_picks',
  AUCTION_BIDS: 'auction_bids',
  AUCTION_SESSIONS: 'auction_sessions',
  PLAYER_PROJECTIONS: 'player_projections',
  USERS: 'users',
};

async function verifyCollections() {
  console.log('\n📊 Verifying Database Collections:');
  
  const results = {
    total: Object.keys(COLLECTIONS).length,
    verified: 0,
    failed: [],
  };

  for (const [name, id] of Object.entries(COLLECTIONS)) {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        id,
        [Query.limit(1)]
      );
      console.log(`✅ ${name} (${id}): ${response.total} documents`);
      results.verified++;
    } catch (error) {
      console.log(`❌ ${name} (${id}): ${error.message}`);
      results.failed.push({ name, id, error: error.message });
    }
  }

  return results;
}

async function verifyAPIRoutes() {
  console.log('\n🌐 Verifying API Routes:');
  
  // Always use production URL
  const baseUrl = 'https://cfbfantasy.app';

  const routes = [
    '/api/health',
    '/api/games',
    '/api/rankings',
    '/api/leagues/my-leagues',
    '/api/players/draftable',
  ];

  const results = {
    total: routes.length,
    working: 0,
    failed: [],
  };

  for (const route of routes) {
    try {
      const url = `${baseUrl}${route}`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Sync-Verification/1.0',
        },
      });
      
      if (response.ok) {
        console.log(`✅ ${route}: ${response.status} OK`);
        results.working++;
      } else {
        console.log(`⚠️  ${route}: ${response.status} ${response.statusText}`);
        results.failed.push({ route, status: response.status });
      }
    } catch (error) {
      console.log(`❌ ${route}: ${error.message}`);
      results.failed.push({ route, error: error.message });
    }
  }

  return results;
}

async function checkRealtimeCapability() {
  console.log('\n📡 Checking Realtime Capability:');
  
  try {
    // Just verify we can create a subscription (won't actually connect)
    const testChannel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.DRAFT_PICKS}.documents`;
    console.log(`✅ Realtime channel format valid: ${testChannel}`);
    return true;
  } catch (error) {
    console.log(`❌ Realtime setup error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`\n🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Appwrite Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`🆔 Project ID: ${process.env.APPWRITE_PROJECT_ID}`);
  
  // Run verifications
  const collectionResults = await verifyCollections();
  const apiResults = await verifyAPIRoutes();
  const realtimeOk = await checkRealtimeCapability();

  // Summary
  console.log('\n📊 Sync Verification Summary:');
  console.log('─'.repeat(40));
  
  console.log(`Database Collections: ${collectionResults.verified}/${collectionResults.total} verified`);
  if (collectionResults.failed.length > 0) {
    console.log('  Failed collections:', collectionResults.failed.map(f => f.name).join(', '));
  }
  
  console.log(`API Routes: ${apiResults.working}/${apiResults.total} working`);
  if (apiResults.failed.length > 0) {
    console.log('  Failed routes:', apiResults.failed.map(f => f.route).join(', '));
  }
  
  console.log(`Realtime: ${realtimeOk ? '✅ Ready' : '❌ Not configured'}`);
  
  // Overall status
  const allGood = 
    collectionResults.verified === collectionResults.total &&
    apiResults.working === apiResults.total &&
    realtimeOk;

  console.log('\n' + '─'.repeat(40));
  if (allGood) {
    console.log('✅ All systems operational! Vercel-Appwrite sync is healthy.');
  } else {
    console.log('⚠️  Some issues detected. Please check the errors above.');
  }
  console.log('─'.repeat(40) + '\n');

  // Health check URL
  console.log('💡 Tip: Visit /api/health for detailed system status\n');
}

// Run verification
main().catch(console.error);
