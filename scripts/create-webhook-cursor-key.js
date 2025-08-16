#!/usr/bin/env node

/**
 * Create Appwrite Webhook using cursor_key with project permissions
 */

require('dotenv').config({ path: '.env.local' });

// Use cursor_key which should have project-level permissions
const CURSOR_KEY = 'standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891';

const WEBHOOK_SECRET = 'f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b';

console.log('🔗 Creating Appwrite Webhook with cursor_key\n');
console.log(`📍 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
console.log(`📍 Project: ${process.env.APPWRITE_PROJECT_ID}`);
console.log(`📍 Using: cursor_key (project-level permissions)`);
console.log(`📍 Key Prefix: ${CURSOR_KEY.substring(0, 20)}...\n`);

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

    console.log('📡 Making API request with cursor_key...');
    
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': CURSOR_KEY,  // Use cursor_key
        'X-Appwrite-Response-Format': '1.6.0'
      },
      body: JSON.stringify(webhookData)
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create webhook');
      console.error(`   Status: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      
      if (response.status === 401) {
        console.error('\n🔍 Possible issues:');
        console.error('   - cursor_key may not have projects.write scope');
        console.error('   - Check key permissions in Appwrite Console');
      }
      
      return null;
    }

    const webhook = await response.json();
    
    console.log('✅ Webhook created successfully!');
    console.log(`📋 Webhook ID: ${webhook.$id}`);
    console.log(`🔗 URL: ${webhook.url}`);
    console.log(`📡 Events: ${webhook.events.length} configured`);
    console.log(`🔒 Security: ${webhook.security ? 'Enabled' : 'Disabled'}`);
    
    console.log('\n🔑 Add this environment variable:');
    console.log(`APPWRITE_WEBHOOK_SECRET=${WEBHOOK_SECRET}`);
    
    console.log('\n🧪 Test the webhook:');
    console.log('   1. Make a schema change in Appwrite Console');
    console.log('   2. Check if a GitHub issue is created automatically');
    console.log('   3. Monitor webhook logs in Appwrite Console');
    
    return webhook;
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    return null;
  }
}

async function listExistingWebhooks() {
  try {
    console.log('📋 Checking existing webhooks with cursor_key...');
    
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': CURSOR_KEY,
        'X-Appwrite-Response-Format': '1.6.0'
      }
    });

    console.log(`📊 List Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`⚠️  Cannot list webhooks: ${response.status}`);
      console.log(`   Response: ${errorText.substring(0, 200)}`);
      return;
    }

    const data = await response.json();
    
    if (data.total === 0) {
      console.log('   ✅ No existing webhooks found - ready to create new one');
    } else {
      console.log(`   📋 Found ${data.total} existing webhooks:`);
      data.webhooks.forEach(webhook => {
        console.log(`   • ${webhook.name} (${webhook.$id})`);
        console.log(`     URL: ${webhook.url}`);
        console.log(`     Events: ${webhook.events.length} configured`);
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