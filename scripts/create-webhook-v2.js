#!/usr/bin/env node

/**
 * Create Appwrite Webhook using the latest API approach
 * Based on node-appwrite 14.2.0 and current Appwrite API
 */

const { Client, Project } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

// Generate a secure webhook secret
const WEBHOOK_SECRET = 'f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b';

console.log('🔗 Creating Appwrite Webhook (v2 approach)\n');

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY);

async function createWebhookWithProject() {
  try {
    const project = new Project(client);
    
    console.log('📋 Creating webhook using Project API...');
    
    const webhook = await project.createWebhook(
      'schema-drift-webhook', // webhookId
      'Schema Drift Detection', // name
      ['databases.*.collections.*.create',
       'databases.*.collections.*.update', 
       'databases.*.collections.*.delete',
       'databases.*.attributes.*.create',
       'databases.*.attributes.*.update',
       'databases.*.attributes.*.delete',
       'databases.*.indexes.*.create',
       'databases.*.indexes.*.update',
       'databases.*.indexes.*.delete'], // events
      'https://cfbfantasy.app/api/webhooks/appwrite/schema-drift', // url
      true, // security
      '', // httpUser
      '', // httpPass
      {
        'X-Webhook-Secret': WEBHOOK_SECRET
      } // headers
    );
    
    console.log('✅ Webhook created successfully!');
    console.log(`📋 Webhook ID: ${webhook.$id}`);
    console.log(`🔗 URL: ${webhook.url}`);
    console.log(`📡 Events: ${webhook.events.length} configured`);
    console.log(`🔒 Security: ${webhook.security ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n🔑 Add this to your environment:');
    console.log(`APPWRITE_WEBHOOK_SECRET=${WEBHOOK_SECRET}`);
    
    return webhook;
    
  } catch (error) {
    console.error('❌ Failed with Project API:', error.message);
    throw error;
  }
}

async function listWebhooksWithProject() {
  try {
    const project = new Project(client);
    const webhooks = await project.listWebhooks();
    
    console.log('📋 Existing webhooks:');
    if (webhooks.total === 0) {
      console.log('   No webhooks found');
    } else {
      webhooks.webhooks.forEach(webhook => {
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

async function createWebhookDirectAPI() {
  console.log('📋 Trying direct API approach...');
  
  try {
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
        'X-Appwrite-Response-Format': '1.7.0'  // Try newer response format
      },
      body: JSON.stringify({
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
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP ${response.status}:`, errorText);
      return null;
    }

    const webhook = await response.json();
    
    console.log('✅ Webhook created with direct API!');
    console.log(`📋 Webhook ID: ${webhook.$id}`);
    console.log(`🔗 URL: ${webhook.url}`);
    console.log(`📡 Events: ${webhook.events.length} configured`);
    
    return webhook;
    
  } catch (error) {
    console.error('❌ Direct API failed:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Appwrite Webhook Setup (Multiple Methods)\n');
  
  // Check environment
  if (!process.env.APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY not found in environment');
    process.exit(1);
  }
  
  console.log(`📍 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`📍 Project: ${process.env.APPWRITE_PROJECT_ID}\n`);
  
  // Method 1: Try Project API
  try {
    await listWebhooksWithProject();
    console.log('\n🔧 Attempting to create webhook...\n');
    await createWebhookWithProject();
    console.log('\n✅ Success with Project API!');
    return;
  } catch (error) {
    console.log(`⚠️  Project API failed: ${error.message}\n`);
  }
  
  // Method 2: Try direct API
  try {
    const result = await createWebhookDirectAPI();
    if (result) {
      console.log('\n✅ Success with Direct API!');
      return;
    }
  } catch (error) {
    console.log(`⚠️  Direct API failed: ${error.message}\n`);
  }
  
  console.log('\n❌ All methods failed. You may need to:');
  console.log('   1. Check API key has project-level permissions');
  console.log('   2. Use Appwrite Console to create webhook manually');
  console.log('   3. Upgrade to a newer version of node-appwrite');
}

if (require.main === module) {
  main().catch(console.error);
}