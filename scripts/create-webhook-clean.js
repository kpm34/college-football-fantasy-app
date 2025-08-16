#!/usr/bin/env node

/**
 * Create Appwrite Webhook with clean API key handling
 */

require('dotenv').config({ path: '.env.local' });

// Use the same sanitization from appwrite-server.ts
function sanitizeApiKey(raw) {
  if (!raw) return '';
  return raw.replace(/^"|"$/g, '').replace(/\r?\n$/g, '');
}

const WEBHOOK_SECRET = 'f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b';
const cleanApiKey = sanitizeApiKey(process.env.APPWRITE_API_KEY);

console.log('🔗 Creating Appwrite Webhook with clean API key\n');
console.log(`📍 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
console.log(`📍 Project: ${process.env.APPWRITE_PROJECT_ID}`);
console.log(`📍 API Key Length: ${cleanApiKey.length}`);
console.log(`📍 API Key Prefix: ${cleanApiKey.substring(0, 20)}...\n`);

async function createWebhook() {
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
        'X-Webhook-Secret': WEBHOOK_SECRET
      }
    };

    console.log('📡 Making API request...');
    
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': cleanApiKey,  // Use cleaned key
        'X-Appwrite-Response-Format': '1.6.0'
      },
      body: JSON.stringify(webhookData)
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    const responseText = await response.text();
    console.log(`📋 Response Body: ${responseText.substring(0, 200)}...\n`);

    if (!response.ok) {
      console.error('❌ Failed to create webhook');
      console.error(`   Status: ${response.status}`);
      console.error(`   Body: ${responseText}`);
      return null;
    }

    const webhook = JSON.parse(responseText);
    
    console.log('✅ Webhook created successfully!');
    console.log(`📋 Webhook ID: ${webhook.$id}`);
    console.log(`🔗 URL: ${webhook.url}`);
    console.log(`📡 Events: ${webhook.events.length} configured`);
    console.log(`🔒 Security: ${webhook.security ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n🔑 Add this environment variable:');
    console.log(`APPWRITE_WEBHOOK_SECRET=${WEBHOOK_SECRET}`);
    
    console.log('\n🧪 Test the webhook:');
    console.log('   1. Make a schema change in Appwrite Console');
    console.log('   2. Check if a GitHub issue is created');
    console.log('   3. Monitor webhook logs in Appwrite Console');
    
    return webhook;
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    return null;
  }
}

async function listExistingWebhooks() {
  try {
    console.log('📋 Checking existing webhooks...');
    
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': cleanApiKey,
        'X-Appwrite-Response-Format': '1.6.0'
      }
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.log(`⚠️  Cannot list webhooks: ${response.status}`);
      console.log(`   Response: ${responseText.substring(0, 200)}`);
      return;
    }

    const data = JSON.parse(responseText);
    
    if (data.total === 0) {
      console.log('   No existing webhooks found');
    } else {
      console.log(`   Found ${data.total} existing webhooks:`);
      data.webhooks.forEach(webhook => {
        console.log(`   • ${webhook.name} (${webhook.$id})`);
      });
    }
    console.log('');
    
  } catch (error) {
    console.log(`⚠️  Could not list webhooks: ${error.message}\n`);
  }
}

async function main() {
  await listExistingWebhooks();
  await createWebhook();
}

if (require.main === module) {
  main().catch(console.error);
}