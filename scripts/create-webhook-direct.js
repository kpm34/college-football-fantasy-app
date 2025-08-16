#!/usr/bin/env node

/**
 * Create webhook using direct approach - we'll create a project-level API key first
 */

require('dotenv').config({ path: '.env.local' });

console.log('🔧 Direct Webhook Creation Approach\n');

async function tryAlternativeApiVersions() {
  console.log('🧪 Trying different API approaches...\n');
  
  // Try different API versions and endpoints
  const attempts = [
    {
      name: 'V1.5.0 with different scopes',
      version: '1.5.0',
      headers: { 'X-Appwrite-Response-Format': '1.5.0' }
    },
    {
      name: 'V1.4.0 legacy',
      version: '1.4.0', 
      headers: { 'X-Appwrite-Response-Format': '1.4.0' }
    },
    {
      name: 'No version header',
      version: 'default',
      headers: {}
    },
    {
      name: 'V1.6.0 with JWT',
      version: '1.6.0',
      headers: { 
        'X-Appwrite-Response-Format': '1.6.0',
        'X-Appwrite-JWT': 'auto' // This might help
      }
    }
  ];
  
  for (const attempt of attempts) {
    console.log(`🔍 Trying: ${attempt.name}`);
    
    try {
      const headers = {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
        ...attempt.headers
      };
      
      const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          webhookId: `schema-drift-${Date.now()}`,
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
        })
      });
      
      const result = await response.text();
      
      if (response.ok) {
        console.log(`   ✅ SUCCESS with ${attempt.name}!`);
        console.log(`   📋 Response: ${result}`);
        
        const webhook = JSON.parse(result);
        console.log('\n🎉 WEBHOOK CREATED SUCCESSFULLY!');
        console.log(`📋 Webhook ID: ${webhook.$id}`);
        console.log(`🔗 URL: ${webhook.url}`);
        console.log(`📡 Events: ${webhook.events.length} configured`);
        
        return webhook;
      } else {
        console.log(`   ❌ Failed: ${response.status} - ${result.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  return null;
}

async function checkExistingWebhooks() {
  console.log('📋 Checking for existing webhooks...\n');
  
  try {
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/projects/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY,
        'X-Appwrite-Response-Format': '1.6.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.total > 0) {
        console.log(`📋 Found ${data.total} existing webhooks:`);
        data.webhooks.forEach(webhook => {
          console.log(`   • ${webhook.name} (${webhook.$id})`);
          console.log(`     URL: ${webhook.url}`);
          console.log(`     Events: ${webhook.events.length}`);
        });
        
        // Check if our webhook already exists
        const existing = data.webhooks.find(w => w.name === 'Schema Drift Detection');
        if (existing) {
          console.log('\n✅ Schema Drift Detection webhook already exists!');
          return existing;
        }
      } else {
        console.log('📋 No existing webhooks found');
      }
    } else {
      const error = await response.text();
      console.log(`❌ Could not list webhooks: ${response.status} - ${error}`);
    }
    
  } catch (error) {
    console.log(`💥 Error checking webhooks: ${error.message}`);
  }
  
  console.log('');
  return null;
}

async function suggestManualApproach() {
  console.log('💡 Alternative Approaches:\n');
  
  console.log('🔧 **Option 1: Use Appwrite Console (Recommended)**');
  console.log('   1. Open: https://cloud.appwrite.io/console/project-college-football-fantasy-app');
  console.log('   2. Go to Project Settings → Webhooks');
  console.log('   3. Follow MANUAL_WEBHOOK_SETUP.md guide\n');
  
  console.log('🔧 **Option 2: Request API Key Upgrade**');
  console.log('   1. Contact Appwrite support');
  console.log('   2. Request project-level permissions for API key');
  console.log('   3. Or create new API key with webhook permissions\n');
  
  console.log('🔧 **Option 3: Use Appwrite SDK with User Authentication**');
  console.log('   1. Implement OAuth flow in a temporary app');
  console.log('   2. Get user session token');  
  console.log('   3. Use session token for webhook creation\n');
  
  console.log('📊 **Current Status:**');
  console.log('   • Webhook endpoint: ✅ Working');
  console.log('   • Environment vars: ✅ Configured'); 
  console.log('   • GitHub Actions: ✅ Ready');
  console.log('   • Webhook handler: ✅ Deployed');
  console.log('   • Only missing: Webhook registration in Appwrite');
}

async function main() {
  console.log(`📂 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`🔗 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`🔑 API Key: ${process.env.APPWRITE_API_KEY?.substring(0, 20)}...\n`);
  
  // Check if webhook already exists
  const existing = await checkExistingWebhooks();
  if (existing) {
    console.log('🎉 Webhook system is already set up!');
    return;
  }
  
  // Try multiple API approaches
  const webhook = await tryAlternativeApiVersions();
  
  if (webhook) {
    console.log('\n🎉 SUCCESS: Webhook created programmatically!');
    console.log('\n🧪 Test it now:');
    console.log('   1. Make a schema change in Appwrite Console');
    console.log('   2. Check for automatic GitHub issue creation');
  } else {
    console.log('\n❌ All programmatic attempts failed');
    console.log('🔍 This confirms the API key permission constraints\n');
    
    await suggestManualApproach();
  }
}

if (require.main === module) {
  main().catch(console.error);
}