#!/usr/bin/env node

/**
 * Login to Appwrite and create webhook using user session
 */

const { spawn, execSync } = require('child_process');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

console.log('🔐 Appwrite Login & Webhook Creation\n');

async function clearExistingSession() {
  console.log('🧹 Clearing existing sessions...');
  
  try {
    // Clear any existing configuration that uses API key
    execSync('appwrite client --endpoint "" --project-id "" --key ""', {
      stdio: 'pipe'
    });
    console.log('   ✅ Cleared API key configuration');
  } catch (error) {
    // This is expected to fail, we just want to clear it
  }
}

async function performLogin() {
  console.log('🔐 Starting login process...');
  console.log('   This will open your browser for authentication\n');
  
  return new Promise((resolve) => {
    const loginProcess = spawn('appwrite', ['login'], {
      stdio: 'inherit'
    });
    
    loginProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Login successful!');
        resolve(true);
      } else {
        console.log(`\n❌ Login failed with code ${code}`);
        resolve(false);
      }
    });
    
    loginProcess.on('error', (error) => {
      console.log(`\n💥 Login error: ${error.message}`);
      resolve(false);
    });
  });
}

async function checkAuthStatus() {
  console.log('🔍 Checking authentication status...');
  
  try {
    const result = execSync('appwrite account get', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('email')) {
      console.log('   ✅ Authenticated successfully');
      
      // Extract email from response
      const emailMatch = result.match(/"email":\s*"([^"]+)"/);
      if (emailMatch) {
        console.log(`   📧 Logged in as: ${emailMatch[1]}`);
      }
      
      return true;
    }
  } catch (error) {
    console.log('   ❌ Not authenticated');
    console.log(`   Error: ${error.message.substring(0, 100)}`);
  }
  
  return false;
}

async function createWebhook() {
  console.log('\n📡 Creating webhook with user session...');
  
  try {
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
    ].join(',');
    
    const result = execSync(`appwrite projects create-webhook \
      --project-id "${process.env.APPWRITE_PROJECT_ID}" \
      --name "Schema Drift Detection" \
      --url "https://cfbfantasy.app/api/webhooks/appwrite/schema-drift" \
      --events "${events}" \
      --security true \
      --http-user "" \
      --http-pass ""`, {
      encoding: 'utf8'
    });
    
    console.log('   ✅ Webhook created successfully!');
    console.log('\n📋 Webhook Details:');
    console.log(result);
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Failed to create webhook: ${error.message}`);
    console.log('\n💡 Error details:');
    console.log(error.message);
    return false;
  }
}

async function listWebhooks() {
  console.log('\n📋 Listing current webhooks...');
  
  try {
    const result = execSync(`appwrite projects list-webhooks --project-id "${process.env.APPWRITE_PROJECT_ID}"`, {
      encoding: 'utf8'
    });
    
    console.log('✅ Current webhooks:');
    console.log(result);
    
    if (result.includes('Schema Drift Detection')) {
      console.log('\n🎉 Schema Drift Detection webhook found!');
      return true;
    }
    
  } catch (error) {
    console.log(`   ❌ Failed to list webhooks: ${error.message}`);
  }
  
  return false;
}

async function addWebhookHeaders() {
  console.log('\n🔑 Adding webhook secret header...');
  
  try {
    // First, get the webhook ID
    const listResult = execSync(`appwrite projects list-webhooks --project-id "${process.env.APPWRITE_PROJECT_ID}"`, {
      encoding: 'utf8'
    });
    
    // Parse the webhook ID (this is simplified - may need adjustment based on actual output format)
    const lines = listResult.split('\n');
    let webhookId = null;
    
    for (const line of lines) {
      if (line.includes('Schema Drift Detection')) {
        // Try to extract ID from the line or surrounding lines
        const idMatch = line.match(/([a-f0-9]{20,})/i);
        if (idMatch) {
          webhookId = idMatch[1];
          break;
        }
      }
    }
    
    if (!webhookId) {
      console.log('   ⚠️  Could not automatically find webhook ID');
      console.log('   💡 You can add the header manually in Appwrite Console');
      console.log(`   Header: X-Webhook-Secret = ${process.env.APPWRITE_WEBHOOK_SECRET}`);
      return false;
    }
    
    console.log(`   📋 Found webhook ID: ${webhookId}`);
    
    // Note: Adding headers via CLI might not be supported
    // This is a placeholder for the attempt
    console.log('   ⚠️  Adding headers via CLI may not be supported');
    console.log('   💡 Please add this header manually in Appwrite Console:');
    console.log(`   X-Webhook-Secret: ${process.env.APPWRITE_WEBHOOK_SECRET}`);
    
    return false;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`📂 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT}\n`);
  
  // Step 1: Clear existing API key configuration
  await clearExistingSession();
  
  // Step 2: Perform login
  const loginSuccess = await performLogin();
  
  if (!loginSuccess) {
    console.log('\n❌ Login failed - cannot proceed');
    return;
  }
  
  // Step 3: Verify authentication
  const isAuthenticated = await checkAuthStatus();
  
  if (!isAuthenticated) {
    console.log('\n❌ Authentication verification failed');
    return;
  }
  
  // Step 4: Create webhook
  const webhookCreated = await createWebhook();
  
  if (!webhookCreated) {
    console.log('\n❌ Webhook creation failed');
    return;
  }
  
  // Step 5: List webhooks to confirm
  const webhookExists = await listWebhooks();
  
  // Step 6: Add headers (might require manual step)
  await addWebhookHeaders();
  
  if (webhookExists) {
    console.log('\n🎉 SUCCESS! Webhook system is now fully operational!');
    console.log('\n🧪 Test it:');
    console.log('   1. Go to Appwrite Console → Database');
    console.log('   2. Add a test attribute to any collection');
    console.log('   3. Check GitHub issues for automatic creation');
    console.log('   4. Watch GitHub Actions workflow run');
    
    console.log('\n🔧 Final step (if needed):');
    console.log('   Add webhook secret header in Appwrite Console:');
    console.log(`   X-Webhook-Secret: ${process.env.APPWRITE_WEBHOOK_SECRET}`);
  } else {
    console.log('\n⚠️  Webhook created but verification failed');
    console.log('   Check Appwrite Console manually');
  }
}

if (require.main === module) {
  main().catch(console.error);
}