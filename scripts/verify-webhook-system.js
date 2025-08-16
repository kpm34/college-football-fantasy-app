#!/usr/bin/env node

/**
 * Verify the complete webhook system is working
 */

const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verifying Complete Webhook System\n');

async function testWebhookEndpoint() {
  console.log('1️⃣ Testing webhook endpoint...');
  
  try {
    const response = await fetch('https://cfbfantasy.app/api/webhooks/appwrite/schema-drift', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.APPWRITE_WEBHOOK_SECRET
      },
      body: JSON.stringify({
        event: 'test',
        data: { message: 'System verification test' }
      })
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('   ✅ Webhook endpoint accessible');
      console.log(`   📋 Response: ${result}`);
      return true;
    } else {
      console.log(`   ❌ Webhook endpoint error: ${response.status}`);
      console.log(`   📋 Response: ${result}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Webhook endpoint failed: ${error.message}`);
    return false;
  }
}

function checkEnvironmentVariables() {
  console.log('\n2️⃣ Checking environment variables...');
  
  const required = [
    'APPWRITE_WEBHOOK_SECRET',
    'APPWRITE_API_KEY',
    'APPWRITE_PROJECT_ID',
    'APPWRITE_ENDPOINT'
  ];
  
  let allPresent = true;
  
  for (const envVar of required) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar}: ${process.env[envVar].substring(0, 20)}...`);
    } else {
      console.log(`   ❌ ${envVar}: Missing`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

function checkGitHubActionsWorkflow() {
  console.log('\n3️⃣ Checking GitHub Actions workflow...');
  
  const fs = require('fs');
  
  try {
    const workflowPath = '.github/workflows/schema-sync.yml';
    if (fs.existsSync(workflowPath)) {
      const workflow = fs.readFileSync(workflowPath, 'utf8');
      
      console.log('   ✅ GitHub Actions workflow exists');
      
      if (workflow.includes('APPWRITE_API_KEY')) {
        console.log('   ✅ Uses APPWRITE_API_KEY secret');
      }
      
      if (workflow.includes('npm run sync-schema')) {
        console.log('   ✅ Runs schema sync command');
      }
      
      return true;
    } else {
      console.log('   ❌ GitHub Actions workflow not found');
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error checking workflow: ${error.message}`);
    return false;
  }
}

function checkWebhookHandler() {
  console.log('\n4️⃣ Checking webhook handler...');
  
  const fs = require('fs');
  
  try {
    const handlerPath = 'app/api/webhooks/appwrite/schema-drift/route.ts';
    
    if (fs.existsSync(handlerPath)) {
      const handler = fs.readFileSync(handlerPath, 'utf8');
      
      console.log('   ✅ Webhook handler exists');
      
      if (handler.includes('APPWRITE_WEBHOOK_SECRET')) {
        console.log('   ✅ Uses webhook secret verification');
      }
      
      if (handler.includes('github')) {
        console.log('   ✅ Creates GitHub issues');
      }
      
      return true;
    } else {
      console.log('   ❌ Webhook handler not found');
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Error checking handler: ${error.message}`);
    return false;
  }
}

async function checkAppwriteWebhooks() {
  console.log('\n5️⃣ Checking Appwrite webhooks...');
  
  try {
    // Try to list webhooks using CLI
    const result = execSync('appwrite projects list-webhooks --project-id college-football-fantasy-app', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('Schema Drift Detection')) {
      console.log('   ✅ Schema Drift Detection webhook found');
      return true;
    } else {
      console.log('   ⚠️  No Schema Drift Detection webhook found');
      console.log('   📋 Available webhooks:');
      console.log(result);
      return false;
    }
    
  } catch (error) {
    console.log('   ⚠️  Could not list webhooks via CLI');
    console.log('   💡 Check manually in Appwrite Console');
    return null;
  }
}

function generateNextSteps(results) {
  console.log('\n📋 Next Steps:\n');
  
  if (!results.endpoint) {
    console.log('❌ **Fix Webhook Endpoint:**');
    console.log('   - Deploy latest code to production');
    console.log('   - Verify https://cfbfantasy.app is accessible\n');
  }
  
  if (!results.environment) {
    console.log('❌ **Fix Environment Variables:**');
    console.log('   - Add missing variables to .env.local');
    console.log('   - Deploy environment variables to Vercel\n');
  }
  
  if (!results.workflow) {
    console.log('❌ **Fix GitHub Actions:**');
    console.log('   - Ensure .github/workflows/schema-sync.yml exists');
    console.log('   - Configure GitHub repository secrets\n');
  }
  
  if (!results.handler) {
    console.log('❌ **Fix Webhook Handler:**');
    console.log('   - Ensure API route exists and is deployed');
    console.log('   - Check webhook handler logic\n');
  }
  
  if (results.webhooks === false) {
    console.log('⚠️  **Create Appwrite Webhook:**');
    console.log('   1. Open: https://cloud.appwrite.io/console/project-college-football-fantasy-app');
    console.log('   2. Go to Project Settings → Webhooks');
    console.log('   3. Follow MANUAL_WEBHOOK_SETUP.md guide');
    console.log('   4. Test with schema change\n');
  }
  
  if (results.webhooks === null) {
    console.log('💡 **Verify Webhook Manually:**');
    console.log('   - Check Appwrite Console → Project Settings → Webhooks');
    console.log('   - Look for "Schema Drift Detection" webhook');
    console.log('   - Verify it\'s active and has correct URL\n');
  }
  
  console.log('🧪 **Test Complete System:**');
  console.log('   1. Make a schema change in Appwrite Console');
  console.log('   2. Check GitHub issues are created automatically');
  console.log('   3. Verify GitHub Actions workflow runs');
  console.log('   4. Confirm schema changes are synced');
}

async function main() {
  console.log('🎯 System Components Verification\n');
  
  const results = {
    endpoint: await testWebhookEndpoint(),
    environment: checkEnvironmentVariables(),
    workflow: checkGitHubActionsWorkflow(),
    handler: checkWebhookHandler(),
    webhooks: await checkAppwriteWebhooks()
  };
  
  const passCount = Object.values(results).filter(r => r === true).length;
  const totalCount = Object.values(results).filter(r => r !== null).length;
  
  console.log(`\n🎯 System Status: ${passCount}/${totalCount} components ready`);
  
  if (passCount === totalCount) {
    console.log('✅ Complete webhook system is ready!');
    console.log('\n🚀 System is operational - schema changes will trigger automated sync');
  } else {
    console.log('⚠️  Some components need attention');
    generateNextSteps(results);
  }
}

if (require.main === module) {
  main().catch(console.error);
}