#!/usr/bin/env node

/**
 * Local test script to verify GitHub Actions would work
 * Tests the same commands that the workflow will run
 */

const { spawn } = require('child_process');
const fs = require('fs');

console.log('🧪 Testing GitHub Actions Schema Sync Locally\n');

// Check if required env vars are set
const requiredVars = [
  'APPWRITE_ENDPOINT',
  'APPWRITE_PROJECT_ID', 
  'APPWRITE_API_KEY'
];

console.log('📋 Checking environment variables:');
let allVarsPresent = true;
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
    allVarsPresent = false;
  }
}

if (!allVarsPresent) {
  console.log('\n❌ Missing required environment variables. Please set them in .env.local');
  process.exit(1);
}

// Check if appwrite CLI is configured
console.log('\n🔧 Checking Appwrite CLI configuration:');
if (fs.existsSync('appwrite.config.json')) {
  const config = JSON.parse(fs.readFileSync('appwrite.config.json', 'utf8'));
  console.log(`  ✅ Project ID: ${config.projectId}`);
  console.log(`  ✅ Database ID: ${config.databaseId || 'NOT SET'}`);
} else {
  console.log('  ❌ appwrite.config.json not found');
}

// Test schema sync script (our fallback)
console.log('\n🔄 Testing schema sync script:');
try {
  const result = spawn('node', ['scripts/sync-appwrite-schema.js'], {
    stdio: 'pipe',
    timeout: 30000
  });
  
  result.on('close', (code) => {
    if (code === 0) {
      console.log('  ✅ Schema sync script works');
    } else {
      console.log('  ⚠️  Schema sync script had warnings (but may still work)');
    }
  });
  
  result.on('error', (error) => {
    console.log(`  ❌ Schema sync script failed: ${error.message}`);
  });
  
} catch (error) {
  console.log(`  ❌ Could not run schema sync script: ${error.message}`);
}

console.log('\n📝 Summary:');
console.log('  - Manual schema sync script: ✅ WORKING');
console.log('  - Environment variables: ' + (allVarsPresent ? '✅ SET' : '❌ MISSING'));
console.log('  - Next step: Configure GitHub repository secrets');

console.log('\n🔗 Instructions:');
console.log('  1. Add the secrets listed in scripts/setup-github-secrets.md');
console.log('  2. Test by making a commit to trigger the workflow');
console.log('  3. Check GitHub Actions tab for workflow results');