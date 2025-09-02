#!/usr/bin/env node

// Add localhost platform using Appwrite SDK with correct method
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function addLocalhostPlatform() {
  const { Client, Projects } = require('node-appwrite');
  
  // Initialize client with API key
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);
  
  const projects = new Projects(client);
  
  try {
    console.log('🔧 Adding localhost platform using SDK...');
    console.log('Project:', projectId);
    console.log('Endpoint:', endpoint);
    console.log('');
    
    // Create Web platform for localhost
    const platform = await projects.createPlatform(
      projectId,        // projectId
      'web',           // type
      'localhost',     // name
      undefined,       // key (optional for web)
      undefined,       // store (optional for web) 
      'localhost'      // hostname (required for web)
    );
    
    console.log('✅ Successfully added localhost platform!');
    console.log('Platform details:', JSON.stringify(platform, null, 2));
    
  } catch (error) {
    if (error.code === 409 || error.message?.includes('already exists')) {
      console.log('✅ localhost platform already exists!');
      
      // Try to list platforms to confirm
      try {
        const platforms = await projects.listPlatforms(projectId);
        console.log('\n📋 Current platforms:');
        platforms.platforms.forEach(p => {
          console.log(`  • ${p.name} (${p.type}): ${p.hostname || p.key || 'N/A'}`);
        });
        
        const hasLocalhost = platforms.platforms.some(p => 
          p.hostname === 'localhost' || p.name === 'localhost'
        );
        
        if (hasLocalhost) {
          console.log('\n✅ Confirmed: localhost is configured!');
        }
      } catch (listError) {
        console.log('Could not list platforms:', listError.message);
      }
      
    } else {
      console.error('❌ Error:', error.message);
      console.error('Code:', error.code);
      console.error('Type:', error.type);
      
      // If it's a permission error, check what the actual issue is
      if (error.code === 401) {
        console.log('\n⚠️  Permission issue detected');
        console.log('Even though the API key has all scopes, the error suggests:');
        console.log('1. The API key might not have been saved properly');
        console.log('2. The project ID might be incorrect');
        console.log('3. The endpoint might be wrong\n');
        
        console.log('Verifying configuration...');
        console.log('APPWRITE_API_KEY starts with:', apiKey.substring(0, 10) + '...');
        console.log('APPWRITE_API_KEY length:', apiKey.length);
        console.log('Project ID:', projectId);
        console.log('Endpoint:', endpoint);
      }
    }
  }
  
  console.log('\n🎯 Test OAuth at: http://localhost:8791');
}

// Run it
addLocalhostPlatform().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
