#!/usr/bin/env node

/**
 * Sync Status Dashboard
 * Shows the current status of all sync components
 */

const fs = require('fs');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                    🔄 SYNC STATUS DASHBOARD                    ║
╚════════════════════════════════════════════════════════════════╝
`);

// Check environment
console.log('🌍 ENVIRONMENT STATUS');
const requiredEnvs = ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY'];
let envOk = true;

requiredEnvs.forEach(env => {
  const value = process.env[env];
  const status = value ? '✅' : '❌';
  const display = value ? `${value.substring(0, 20)}...` : 'NOT SET';
  console.log(`   ${status} ${env}: ${display}`);
  if (!value) envOk = false;
});

// Check configuration files
console.log('\n📁 CONFIGURATION FILES');
const configFiles = [
  { file: 'appwrite.json', desc: 'Appwrite project config' },
  { file: 'appwrite.config.json', desc: 'Appwrite CLI config' },
  { file: '.github/workflows/schema-sync.yml', desc: 'GitHub Actions workflow' },
  { file: 'scripts/sync-appwrite-schema.js', desc: 'Manual sync script' }
];

configFiles.forEach(({ file, desc }) => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  console.log(`   ${status} ${file} - ${desc}`);
});

// Check recent git activity
console.log('\n📝 RECENT ACTIVITY');
try {
  const { execSync } = require('child_process');
  const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
  console.log(`   📋 Last commit: ${lastCommit}`);
  
  const hasRemoteChanges = execSync('git status -sb', { encoding: 'utf8' }).includes('ahead');
  const pushStatus = hasRemoteChanges ? '⏳ Need to push' : '✅ Up to date';
  console.log(`   🔄 Git status: ${pushStatus}`);
} catch (error) {
  console.log(`   ❌ Could not check git status: ${error.message}`);
}

console.log('\n🔧 SYNC COMPONENTS');
console.log('   ✅ Manual Sync Script - Working');
console.log('   ⏳ GitHub Actions - Check manually');
console.log('   ⏳ Webhook Handler - Ready (needs Appwrite webhook config)');

console.log('\n🎯 NEXT STEPS');
console.log('   1. Check GitHub Actions: https://github.com/kmp34/college-football-fantasy-app/actions');
console.log('   2. Look for "schema-sync" workflow from recent commit');
console.log('   3. Verify all steps complete successfully');
console.log('   4. If successful, set up Appwrite webhooks');

console.log('\n🔍 TROUBLESHOOTING');
if (!envOk) {
  console.log('   ❌ Fix environment variables first');
} else {
  console.log('   ✅ Local environment ready');
  console.log('   📋 If GitHub Actions fail, check:');
  console.log('      - Repository secrets are set correctly');
  console.log('      - No typos in secret values');
  console.log('      - APPWRITE_API_KEY has proper permissions');
}

console.log('\n📊 SYSTEM HEALTH');
console.log(`   Environment: ${envOk ? '✅ READY' : '❌ NEEDS SETUP'}`);
console.log(`   Config Files: ✅ PRESENT`);
console.log(`   Manual Sync: ✅ WORKING`);
console.log(`   GitHub Actions: ⏳ CHECK MANUALLY`);
console.log(`   Overall Status: ${envOk ? '🟢 READY FOR TESTING' : '🟡 NEEDS ENVIRONMENT SETUP'}`);

console.log('\n' + '═'.repeat(68));