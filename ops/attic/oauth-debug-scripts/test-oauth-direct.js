#!/usr/bin/env node

// Direct OAuth test - see if it works regardless of platform config
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('🧪 Direct OAuth Test');
console.log('====================\n');

console.log('Testing OAuth with these URLs:\n');

// Test URLs
const urls = [
  {
    name: 'Token Flow (Recommended)',
    url: `${endpoint}/account/sessions/oauth2/google/token?project=${projectId}&success=${encodeURIComponent('http://localhost:8789/debug')}&failure=${encodeURIComponent('http://localhost:8789/debug')}`
  },
  {
    name: 'Standard Flow',
    url: `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent('http://localhost:8789/debug')}&failure=${encodeURIComponent('http://localhost:8789/debug')}`
  }
];

urls.forEach((item, index) => {
  console.log(`${index + 1}. ${item.name}:`);
  console.log(`   ${item.url}\n`);
});

console.log('📋 Instructions:');
console.log('----------------');
console.log('1. Open http://localhost:8789 in your browser');
console.log('2. Try the "Token Flow" button first');
console.log('3. If you get to Google login - platform config is OK!');
console.log('4. If you get an error immediately - platform needs to be added\n');

console.log('🔍 What to look for:');
console.log('--------------------');
console.log('SUCCESS: You reach Google login page = Platform config is fine');
console.log('FAIL: Immediate error about platform = Need to add localhost\n');

console.log('💡 Quick Fix if needed:');
console.log('------------------------');
console.log('The fact that your API key lacks platform scopes suggests');
console.log('it\'s a restricted key (good for security!).\n');
console.log('You have two options:');
console.log('1. Test with your production domain instead (cfbfantasy.app)');
console.log('2. Temporarily create a new API key with all scopes\n');

// Open browser to test
const open = require('open');
open('http://localhost:8789').then(() => {
  console.log('✅ Opened test page in browser');
  console.log('   Click "Try Token Flow" to test!\n');
}).catch(() => {
  console.log('Visit: http://localhost:8789');
});
