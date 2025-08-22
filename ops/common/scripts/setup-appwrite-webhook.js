#!/usr/bin/env node

/**
 * Create Appwrite Webhook for Schema Drift Detection
 * Uses the Appwrite API to programmatically set up the webhook
 */

const { Client, Functions } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Generate a secure webhook secret
const WEBHOOK_SECRET = 'f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

async function createWebhook() {
  console.log('🔗 Creating Appwrite Webhook for Schema Drift Detection\n');
  
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

  try {
    // Use direct API call since the Functions SDK is for cloud functions, not webhooks
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      },
      body: JSON.stringify({
        webhookId: webhookData.webhookId,
        name: webhookData.name,
        url: webhookData.url,
        events: webhookData.events,
        security: webhookData.security,
        httpUser: webhookData.httpUser,
        httpPass: webhookData.httpPass,
        headers: webhookData.headers
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const webhook = await response.json();
    
    console.log('✅ Webhook created successfully!');
    console.log(`📋 Webhook ID: ${webhook.$id}`);
    console.log(`🔗 URL: ${webhook.url}`);
    console.log(`📡 Events: ${webhook.events.length} configured`);
    console.log(`🔒 Security: ${webhook.security ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n🔑 Important: Add this webhook secret to your environment:');
    console.log(`APPWRITE_WEBHOOK_SECRET=${WEBHOOK_SECRET}`);
    
    console.log('\n🧪 Test the webhook by making a change in Appwrite Console');
    console.log('   1. Go to your database collections');
    console.log('   2. Add/modify an attribute');
    console.log('   3. Check if a GitHub issue is created automatically');
    
    return webhook;
    
  } catch (error) {
    console.error('❌ Failed to create webhook:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 Webhook might already exist. Try listing existing webhooks:');
      await listWebhooks();
    }
    
    throw error;
  }
}

async function listWebhooks() {
  try {
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log('\n📋 Existing webhooks:');
    
    if (data.total === 0) {
      console.log('   No webhooks found');
    } else {
      data.webhooks.forEach(webhook => {
        console.log(`   • ${webhook.name} (${webhook.$id})`);
        console.log(`     URL: ${webhook.url}`);
        console.log(`     Events: ${webhook.events.length} configured`);
        console.log(`     Security: ${webhook.security ? 'Enabled' : 'Disabled'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to list webhooks:', error.message);
  }
}

async function main() {
  console.log('🚀 Appwrite Webhook Setup\n');
  
  // Check environment variables
  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY not found in environment');
    process.exit(1);
  }
  
  console.log(`📍 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`📍 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  
  try {
    // First list existing webhooks
    await listWebhooks();
    
    // Then create the new webhook
    await createWebhook();
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}