#!/usr/bin/env node

/**
 * Create a proper project-level API key with webhook permissions
 * This requires user authentication, not just an API key
 */

const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

console.log('🔑 Creating Project-Level API Key for Webhooks\n');

async function authenticateUser() {
  console.log('1️⃣ Authenticating with Appwrite...');
  
  try {
    // Try to check current session
    const result = execSync('appwrite account get', {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (result.includes('email')) {
      console.log('   ✅ Already authenticated');
      return true;
    }
  } catch (error) {
    console.log('   ⚠️  No active session found');
  }
  
  console.log('\n🔐 Please authenticate with your Appwrite account:');
  console.log('   Run: appwrite login');
  console.log('   Use email: kashpm2002@gmail.com');
  console.log('   Enter your password when prompted');
  
  return false;
}

async function createProjectApiKey() {
  console.log('\n2️⃣ Creating project-level API key...');
  
  try {
    // Create API key with project permissions
    const result = execSync(`appwrite projects create-key \
      --project-id="${process.env.APPWRITE_PROJECT_ID}" \
      --name="Webhook Management Key" \
      --scopes="projects.read,projects.write,webhooks.read,webhooks.write,databases.read,databases.write,collections.read,collections.write,attributes.read,attributes.write,indexes.read,indexes.write"`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('   ✅ Project API key created successfully');
    console.log('\n📋 New API Key Details:');
    console.log(result);
    
    // Extract the API key from the response
    const keyMatch = result.match(/"secret":\s*"([^"]+)"/);
    if (keyMatch) {
      const newApiKey = keyMatch[1];
      console.log('\n🔑 New API Key (save this):');
      console.log(newApiKey);
      
      return newApiKey;
    }
    
  } catch (error) {
    console.log(`   ❌ Failed to create API key: ${error.message}`);
    return null;
  }
}

async function createWebhookWithNewKey(apiKey) {
  console.log('\n3️⃣ Creating webhook with project-level API key...');
  
  try {
    const webhookData = {
      webhookId: 'schema-drift-webhook',
      name: 'Schema Drift Detection',
      url: 'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift',
      events: [
        'databases.*.collections.*.create',
        'databases.*.collections.*.update', 
        'databases.*.collections.*.delete',
        'databases.*.attributes.*.create',
        'databases.*.attributes.*.update',
        'databases.*.attributes.*.delete',
        'databases.*.indexes.*.create',
        'databases.*.indexes.*.update',
        'databases.*.indexes.*.delete'
      ],
      security: true,
      httpUser: '',
      httpPass: '',
      headers: {
        'X-Webhook-Secret': process.env.APPWRITE_WEBHOOK_SECRET
      }
    };

    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': apiKey,
        'X-Appwrite-Response-Format': '1.6.0'
      },
      body: JSON.stringify(webhookData)
    });

    if (response.ok) {
      const webhook = await response.json();
      
      console.log('   ✅ Webhook created successfully!');
      console.log(`   📋 Webhook ID: ${webhook.$id}`);
      console.log(`   🔗 URL: ${webhook.url}`);
      console.log(`   📡 Events: ${webhook.events.length} configured`);
      
      console.log('\n🎉 SUCCESS: Complete webhook system is now active!');
      console.log('\n🧪 Test it:');
      console.log('   1. Make a schema change in Appwrite Console');
      console.log('   2. Check GitHub issues for automatic creation');
      console.log('   3. Verify GitHub Actions workflow runs');
      
      return webhook;
    } else {
      const error = await response.text();
      console.log(`   ❌ Failed to create webhook: ${error}`);
      return null;
    }
    
  } catch (error) {
    console.log(`   ❌ Error creating webhook: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log(`📂 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT}\n`);
  
  // Step 1: Authenticate user
  const isAuthenticated = await authenticateUser();
  
  if (!isAuthenticated) {
    console.log('\n⏸️  Please run `appwrite login` first, then run this script again.');
    return;
  }
  
  // Step 2: Create project-level API key
  const projectApiKey = await createProjectApiKey();
  
  if (!projectApiKey) {
    console.log('\n❌ Could not create project API key');
    return;
  }
  
  // Step 3: Create webhook using new key
  const webhook = await createWebhookWithNewKey(projectApiKey);
  
  if (webhook) {
    console.log('\n✅ Webhook system is fully operational!');
    console.log('\n💡 Optional: Update .env.local with new project key:');
    console.log(`APPWRITE_PROJECT_API_KEY=${projectApiKey}`);
  } else {
    console.log('\n❌ Webhook creation failed');
  }
}

if (require.main === module) {
  main().catch(console.error);
}