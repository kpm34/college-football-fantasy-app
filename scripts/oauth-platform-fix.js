#!/usr/bin/env node

// Alternative approach: Check existing platforms and provide exact fix
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('🔍 OAuth Platform Diagnostic & Fix');
console.log('===================================\n');

// Generate the direct console URL
const consoleUrl = `https://nyc.cloud.appwrite.io/console/project-${projectId}/settings/platforms`;

console.log('📋 Quick Fix Instructions:');
console.log('---------------------------');
console.log('1. I\'m opening the Appwrite Console for you...');
console.log(`2. URL: ${consoleUrl}`);
console.log('3. Click the "Add platform" button');
console.log('4. Select "Web" (any framework icon works)');
console.log('5. Enter hostname: localhost');
console.log('6. Click "Create platform"\n');

console.log('🎯 After adding localhost:');
console.log('The OAuth test at http://localhost:8789 will work!\n');

console.log('💡 Pro tip: While you\'re there, also add:');
console.log('   • cfbfantasy.app');
console.log('   • collegefootballfantasy.app');
console.log('   • *.vercel.app\n');

// Open the console directly
const open = require('open');
open(consoleUrl).then(() => {
  console.log('✅ Opened Appwrite Console in your browser!');
  console.log('   Follow the steps above to add localhost.\n');
  console.log('🧪 OAuth test server is still running at: http://localhost:8789');
  console.log('   Test it after adding the platform!');
}).catch(() => {
  console.log('⚠️  Couldn\'t auto-open browser. Please visit:');
  console.log(`   ${consoleUrl}`);
});
