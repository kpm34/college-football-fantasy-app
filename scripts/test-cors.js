#!/usr/bin/env node

const https = require('https');

const ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = 'college-football-fantasy-app';

console.log('Testing CORS headers from Appwrite...\n');

// Test from different origins
const origins = [
  'https://cfbfantasy.app',
  'https://www.cfbfantasy.app',
  'https://localhost',
  'http://localhost:3000',
  'http://localhost:3001'
];

async function testCORS(origin) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'nyc.cloud.appwrite.io',
      path: '/v1/account',
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'X-Appwrite-Project',
        'X-Appwrite-Project': PROJECT_ID
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Testing origin: ${origin}`);
      console.log(`Status: ${res.statusCode}`);
      console.log('CORS Headers:');
      console.log(`  Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'NOT SET'}`);
      console.log(`  Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'NOT SET'}`);
      console.log(`  Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'NOT SET'}`);
      console.log(`  Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'NOT SET'}`);
      console.log('---\n');
      resolve();
    });

    req.on('error', (error) => {
      console.error(`Error testing ${origin}:`, error.message);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  for (const origin of origins) {
    await testCORS(origin);
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\nIf you see "https://localhost" as the Access-Control-Allow-Origin');
  console.log('for production domains, there might be a caching issue.');
  console.log('\nTry these solutions:');
  console.log('1. Clear CloudFlare/CDN cache if using one');
  console.log('2. Wait a few minutes for Appwrite to update');
  console.log('3. Contact Appwrite support if the issue persists');
}

runTests();
