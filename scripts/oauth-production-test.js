#!/usr/bin/env node

// Test OAuth with production domain instead of localhost
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('🚀 Production Domain OAuth Test');
console.log('================================\n');

console.log('Since localhost isn\'t working, test with your production domains:\n');

const productionUrls = [
  {
    domain: 'cfbfantasy.app',
    url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('https://cfbfantasy.app/api/auth/callback/google')}&failure=${encodeURIComponent('https://cfbfantasy.app/api/auth/callback/google')}&project=${projectId}`
  },
  {
    domain: 'collegefootballfantasy.app', 
    url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('https://collegefootballfantasy.app/api/auth/callback/google')}&failure=${encodeURIComponent('https://collegefootballfantasy.app/api/auth/callback/google')}&project=${projectId}`
  }
];

console.log('Production OAuth URLs:\n');
productionUrls.forEach((item, index) => {
  console.log(`${index + 1}. ${item.domain}:`);
  console.log(`   ${item.url}\n`);
});

console.log('📋 To test production OAuth:');
console.log('------------------------------');
console.log('1. Deploy your app to Vercel first');
console.log('2. Visit one of the URLs above');
console.log('3. If you reach Google login → OAuth is configured correctly!');
console.log('4. The issue is just localhost platform configuration\n');

console.log('🔧 To fix localhost testing:');
console.log('-----------------------------');
console.log('You MUST add localhost as a platform. Since API access is restricted, do it manually:\n');
console.log('1. Go to: https://nyc.cloud.appwrite.io');
console.log('2. Login with your admin account');
console.log('3. Navigate to: Project → Settings → Platforms');
console.log('4. Click "Add Platform"');
console.log('5. Choose "Web App"');
console.log('6. Enter hostname: localhost');
console.log('7. Save\n');

console.log('Alternative: Create a new API key with full permissions:');
console.log('1. Go to API Keys in Appwrite Console');
console.log('2. Create new key with ALL scopes');
console.log('3. Update APPWRITE_API_KEY in .env.local');
console.log('4. Run: node scripts/add-platform-correct.js');
console.log('5. Switch back to restricted key after setup\n');

// Open the console directly
const open = require('open');
const consoleUrl = 'https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/platforms';

console.log('Opening Appwrite Console...');
open(consoleUrl).then(() => {
  console.log('✅ Opened platforms page in browser');
  console.log('   Add localhost as described above!');
}).catch(() => {
  console.log('Visit:', consoleUrl);
});
