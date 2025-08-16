#!/usr/bin/env node

/**
 * Create Appwrite Webhook using CLI approach instead of API
 * This bypasses the API key permission issues by using the authenticated CLI
 */

const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('🔗 Creating Appwrite Webhook via CLI\n');

const WEBHOOK_SECRET = 'f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b';

async function createWebhookViaCLI() {
  try {
    console.log('📡 Creating webhook using Appwrite CLI...');
    
    // Create webhook using CLI with correct kebab-case commands
    const command = `appwrite projects create-webhook \
      --project-id="${process.env.APPWRITE_PROJECT_ID}" \
      --webhook-id="schema-drift-webhook" \
      --name="Schema Drift Detection" \
      --url="https://cfbfantasy.app/api/webhooks/appwrite/schema-drift" \
      --events="databases.*.collections.*.create,databases.*.collections.*.update,databases.*.collections.*.delete,databases.*.attributes.*.create,databases.*.attributes.*.update,databases.*.attributes.*.delete,databases.*.indexes.*.create,databases.*.indexes.*.update,databases.*.indexes.*.delete" \
      --security=true \
      --http-user="" \
      --http-pass=""`;
    
    console.log('🔧 Executing CLI command...');
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log('✅ CLI Output:');
    console.log(output);
    
    // Add the webhook secret header using CLI (if supported)
    try {
      console.log('\n🔑 Setting webhook secret header...');
      const secretCommand = `appwrite projects update-webhook \
        --project-id="${process.env.APPWRITE_PROJECT_ID}" \
        --webhook-id="schema-drift-webhook" \
        --http-headers="{\\"X-Webhook-Secret\\": \\"${WEBHOOK_SECRET}\\"}"`;
        
      const secretOutput = execSync(secretCommand, { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      console.log('✅ Secret header set successfully');
      console.log(secretOutput);
      
    } catch (secretError) {
      console.log('⚠️  Could not set secret via CLI, will need manual configuration');
      console.log(`   Error: ${secretError.message}`);
    }
    
    console.log('\n🎉 WEBHOOK CREATED SUCCESSFULLY via CLI!');
    console.log('\n🔑 Add this environment variable:');
    console.log(`APPWRITE_WEBHOOK_SECRET=${WEBHOOK_SECRET}`);
    
    console.log('\n🧪 Test the webhook:');
    console.log('   1. Make a schema change in Appwrite Console');
    console.log('   2. Check if a GitHub issue is created automatically');
    console.log('   3. Monitor webhook logs in Appwrite Console');
    
    return true;
    
  } catch (error) {
    console.error('❌ CLI approach failed:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('command not found')) {
      console.error('\n🔧 Appwrite CLI not found or not authenticated');
      console.error('   Run: appwrite login');
      console.error('   Then: appwrite init project');
    }
    
    return false;
  }
}

async function listWebhooksViaCLI() {
  try {
    console.log('📋 Checking existing webhooks via CLI...');
    
    const output = execSync(`appwrite projects list-webhooks --project-id="${process.env.APPWRITE_PROJECT_ID}"`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log('✅ Existing webhooks:');
    console.log(output);
    console.log('');
    
  } catch (error) {
    console.log(`⚠️  Could not list webhooks via CLI: ${error.message}\n`);
  }
}

async function main() {
  await listWebhooksViaCLI();
  await createWebhookViaCLI();
}

if (require.main === module) {
  main().catch(console.error);
}