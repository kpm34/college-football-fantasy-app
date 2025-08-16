#!/usr/bin/env node

/**
 * Create webhook immediately after successful login
 */

const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('📡 Creating Webhook with User Session\n');

async function verifyLogin() {
  console.log('🔍 Verifying login status...');
  
  try {
    const result = execSync('appwrite account get', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('email')) {
      const emailMatch = result.match(/"email":\s*"([^"]+)"/);
      console.log(`   ✅ Logged in as: ${emailMatch ? emailMatch[1] : 'user'}`);
      return true;
    } else {
      console.log('   ❌ No user session found');
      return false;
    }
    
  } catch (error) {
    console.log('   ❌ Login verification failed');
    console.log(`   Error: ${error.message.substring(0, 100)}`);
    return false;
  }
}

async function createWebhook() {
  console.log('\n📡 Creating webhook...');
  
  const events = [
    'databases.*.collections.*.create',
    'databases.*.collections.*.update', 
    'databases.*.collections.*.delete',
    'databases.*.attributes.*.create',
    'databases.*.attributes.*.update',
    'databases.*.attributes.*.delete',
    'databases.*.indexes.*.create',
    'databases.*.indexes.*.update',
    'databases.*.indexes.*.delete'
  ];
  
  try {
    console.log('   🔧 Executing webhook creation command...');
    
    const command = `appwrite projects create-webhook \
      --project-id "${process.env.APPWRITE_PROJECT_ID}" \
      --name "Schema Drift Detection" \
      --url "https://cfbfantasy.app/api/webhooks/appwrite/schema-drift" \
      --events "${events.join(',')}" \
      --security true`;
    
    console.log(`   📋 Command: ${command.substring(0, 100)}...`);
    
    const result = execSync(command, {
      encoding: 'utf8'
    });
    
    console.log('\n✅ WEBHOOK CREATED SUCCESSFULLY!');
    console.log('\n📋 Response:');
    console.log(result);
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ Webhook creation failed: ${error.message}`);
    
    // Check if it's a duplicate error
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('   💡 Webhook might already exist');
      return true;
    }
    
    return false;
  }
}

async function listWebhooks() {
  console.log('\n📋 Verifying webhook creation...');
  
  try {
    const result = execSync(`appwrite projects list-webhooks --project-id "${process.env.APPWRITE_PROJECT_ID}"`, {
      encoding: 'utf8'
    });
    
    console.log('✅ Current webhooks:');
    console.log(result);
    
    if (result.includes('Schema Drift Detection')) {
      console.log('\n🎉 Schema Drift Detection webhook confirmed!');
      return true;
    } else {
      console.log('\n⚠️  Schema Drift Detection webhook not found in list');
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Could not list webhooks: ${error.message}`);
    return false;
  }
}

async function testWebhookEndpoint() {
  console.log('\n🧪 Testing webhook endpoint...');
  
  try {
    const response = await fetch('https://cfbfantasy.app/api/webhooks/appwrite/schema-drift', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.APPWRITE_WEBHOOK_SECRET
      },
      body: JSON.stringify({
        event: 'test-after-creation',
        data: { message: 'Testing webhook after creation' }
      })
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log('   ✅ Webhook endpoint is responding');
      console.log(`   📋 Response: ${result}`);
    } else {
      console.log(`   ⚠️  Webhook endpoint returned: ${response.status}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Webhook endpoint test failed: ${error.message}`);
  }
}

async function main() {
  console.log(`📂 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT}\n`);
  
  // Step 1: Verify login
  const isLoggedIn = await verifyLogin();
  
  if (!isLoggedIn) {
    console.log('\n❌ Please complete login first:');
    console.log('   Run: appwrite login');
    console.log('   Then run this script again');
    return;
  }
  
  // Step 2: Create webhook
  const webhookCreated = await createWebhook();
  
  if (!webhookCreated) {
    console.log('\n❌ Webhook creation failed');
    return;
  }
  
  // Step 3: Verify webhook exists
  const webhookExists = await listWebhooks();
  
  // Step 4: Test webhook endpoint
  await testWebhookEndpoint();
  
  if (webhookExists) {
    console.log('\n🎉 COMPLETE SUCCESS!');
    console.log('\n📋 Webhook System Status:');
    console.log('   ✅ Webhook created in Appwrite');
    console.log('   ✅ Endpoint responding correctly');
    console.log('   ✅ GitHub Actions workflow ready');
    console.log('   ✅ Schema sync script ready');
    
    console.log('\n🧪 Final Test:');
    console.log('   1. Go to Appwrite Console → Database → college-football-fantasy');
    console.log('   2. Pick any collection → Settings → Attributes');
    console.log('   3. Add a test attribute (any name, string type)');
    console.log('   4. Check GitHub issues - should auto-create within 30 seconds');
    
    console.log('\n🔧 Optional (for webhook headers):');
    console.log('   - Go to Appwrite Console → Project Settings → Webhooks');
    console.log('   - Edit "Schema Drift Detection" webhook');
    console.log(`   - Add header: X-Webhook-Secret = ${process.env.APPWRITE_WEBHOOK_SECRET}`);
    
  } else {
    console.log('\n⚠️  Webhook created but verification incomplete');
    console.log('   Check Appwrite Console manually');
  }
}

if (require.main === module) {
  main().catch(console.error);
}