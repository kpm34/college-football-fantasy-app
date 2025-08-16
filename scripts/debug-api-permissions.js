#!/usr/bin/env node

/**
 * Debug API permissions and try different webhook creation approaches
 */

require('dotenv').config({ path: '.env.local' });

const CURSOR_KEY = 'standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891';

console.log('🔍 Debug API Permissions and Webhook Creation\n');

async function testApiPermissions() {
  console.log('1️⃣ Testing different API endpoints and versions...\n');
  
  const testConfigs = [
    { version: '1.6.0', endpoint: 'projects' },
    { version: '1.7.0', endpoint: 'projects' },
    { version: '1.5.0', endpoint: 'projects' },
    { version: '1.4.0', endpoint: 'projects' }
  ];
  
  for (const config of testConfigs) {
    console.log(`🧪 Testing API version ${config.version}...`);
    
    try {
      const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/${config.endpoint}/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
          'X-Appwrite-Key': CURSOR_KEY,
          'X-Appwrite-Response-Format': config.version
        }
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ SUCCESS! Found ${data.total || 0} webhooks`);
        return config; // Return successful config
      } else {
        const error = await response.text();
        console.log(`   ❌ Failed: ${error.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
    }
  }
  
  return null;
}

async function tryNodeAppwriteSDK() {
  console.log('\n2️⃣ Testing node-appwrite SDK approach...\n');
  
  try {
    const { Client, Projects } = require('node-appwrite');
    
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(CURSOR_KEY);
    
    console.log('🔧 Checking if Projects class exists...');
    if (!Projects) {
      console.log('   ❌ Projects class not available in node-appwrite');
      return false;
    }
    
    const projects = new Projects(client);
    console.log('   ✅ Projects class found, testing listWebhooks...');
    
    const webhooks = await projects.listWebhooks();
    console.log(`   ✅ SUCCESS! SDK works - found ${webhooks.total} webhooks`);
    return projects;
    
  } catch (error) {
    console.log(`   ❌ SDK approach failed: ${error.message}`);
    return false;
  }
}

async function tryAlternativeSDK() {
  console.log('\n3️⃣ Testing alternative SDK imports...\n');
  
  const sdkVariations = [
    'Project',
    'Projects', 
    'WebHook',
    'WebHooks',
    'Webhooks'
  ];
  
  for (const className of sdkVariations) {
    try {
      console.log(`🧪 Testing ${className} class...`);
      const { Client, [className]: ServiceClass } = require('node-appwrite');
      
      if (ServiceClass) {
        console.log(`   ✅ ${className} class found!`);
        
        const client = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT)
          .setProject(process.env.APPWRITE_PROJECT_ID)
          .setKey(CURSOR_KEY);
          
        const service = new ServiceClass(client);
        console.log(`   ✅ ${className} instance created successfully`);
        return { className, service };
      }
    } catch (error) {
      console.log(`   ❌ ${className} not available`);
    }
  }
  
  return null;
}

async function createWebhookWithWorkingConfig(config) {
  console.log('\n4️⃣ Creating webhook with working configuration...\n');
  
  const WEBHOOK_SECRET = 'f9e2fe8d197830a54a873c70311f1a16698a7257fb2a9837d54dd4c1df6bbe5b';
  
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
    console.log(`📡 Creating webhook with API version ${config.version}...`);
    
    const response = await fetch(`${process.env.APPWRITE_ENDPOINT}/${config.endpoint}/${process.env.APPWRITE_PROJECT_ID}/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID,
        'X-Appwrite-Key': CURSOR_KEY,
        'X-Appwrite-Response-Format': config.version
      },
      body: JSON.stringify(webhookData)
    });

    if (response.ok) {
      const webhook = await response.json();
      
      console.log('🎉 WEBHOOK CREATED SUCCESSFULLY!');
      console.log(`📋 Webhook ID: ${webhook.$id}`);
      console.log(`🔗 URL: ${webhook.url}`);
      console.log(`📡 Events: ${webhook.events.length} configured`);
      
      console.log('\n🔑 Add to environment:');
      console.log(`APPWRITE_WEBHOOK_SECRET=${WEBHOOK_SECRET}`);
      
      return webhook;
    } else {
      const error = await response.text();
      console.log(`❌ Failed to create webhook: ${error}`);
      return null;
    }
    
  } catch (error) {
    console.log(`💥 Error creating webhook: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log(`📍 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`📍 Project: ${process.env.APPWRITE_PROJECT_ID}`);
  console.log(`📍 Using cursor_key with ALL scopes enabled\n`);
  
  // Test API permissions with different configurations
  const workingConfig = await testApiPermissions();
  
  if (workingConfig) {
    console.log(`\n✅ Found working API configuration: ${workingConfig.version}`);
    await createWebhookWithWorkingConfig(workingConfig);
    return;
  }
  
  // Try SDK approach
  const sdk = await tryNodeAppwriteSDK();
  if (sdk) {
    console.log('\n✅ SDK approach available - webhook creation should work');
    return;
  }
  
  // Try alternative SDK classes
  const altSdk = await tryAlternativeSDK();
  if (altSdk) {
    console.log(`\n✅ Found alternative SDK: ${altSdk.className}`);
    return;
  }
  
  console.log('\n❌ All approaches failed');
  console.log('🔍 This suggests the API key might still have scope issues');
  console.log('💡 Try refreshing the Appwrite Console and check if changes propagated');
}

if (require.main === module) {
  main().catch(console.error);
}