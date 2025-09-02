#!/usr/bin/env node

// Add localhost as a Web platform to Appwrite project
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  console.error('Missing required environment variables');
  console.error('Need: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY');
  process.exit(1);
}

async function addLocalhostPlatform() {
  try {
    console.log('🔧 Adding localhost as Web platform to Appwrite...');
    console.log('Project:', projectId);
    console.log('Endpoint:', endpoint);
    
    // Create a Web platform for localhost
    const response = await fetch(`${endpoint}/projects/${projectId}/platforms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey
      },
      body: JSON.stringify({
        type: 'web',
        name: 'Local Development',
        hostname: 'localhost'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Successfully added localhost platform!');
      console.log('Platform ID:', data.$id);
      console.log('Hostname:', data.hostname);
      return data;
    } else {
      const errorText = await response.text();
      
      // Check if platform already exists
      if (response.status === 409 || errorText.includes('already exists')) {
        console.log('ℹ️  localhost platform already exists - this is OK!');
        
        // Try to list existing platforms to confirm
        const listResponse = await fetch(`${endpoint}/projects/${projectId}/platforms`, {
          method: 'GET',
          headers: {
            'X-Appwrite-Project': projectId,
            'X-Appwrite-Key': apiKey
          }
        });
        
        if (listResponse.ok) {
          const platforms = await listResponse.json();
          const localhostPlatform = platforms.platforms?.find(p => 
            p.hostname === 'localhost' || p.hostname?.includes('localhost')
          );
          
          if (localhostPlatform) {
            console.log('✅ Confirmed: localhost platform exists');
            console.log('Platform details:', localhostPlatform);
          }
        }
        return;
      }
      
      console.error('❌ Failed to add platform:', response.status, errorText);
      
      // If it's a 404, we might need to use a different endpoint
      if (response.status === 404) {
        console.log('\n🔄 Trying alternative approach...');
        
        // Try the console API endpoint instead
        const consoleResponse = await fetch(`${endpoint}/console/projects/${projectId}/platforms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': 'console',
            'X-Appwrite-Key': apiKey,
            'X-Appwrite-Mode': 'admin'
          },
          body: JSON.stringify({
            type: 'web',
            name: 'Local Development',
            hostname: 'localhost'
          })
        });
        
        if (consoleResponse.ok) {
          console.log('✅ Successfully added via console API!');
        } else {
          const consoleError = await consoleResponse.text();
          console.log('Console API also failed:', consoleError);
        }
      }
    }
  } catch (error) {
    console.error('Error adding platform:', error.message);
    
    // Try using the SDK approach
    console.log('\n🔄 Trying SDK approach...');
    const { Client, Projects } = require('node-appwrite');
    
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);
    
    const projects = new Projects(client);
    
    try {
      // Create platform using SDK
      const platform = await projects.createPlatform(
        projectId,
        'web',
        'Local Development',
        undefined, // key (optional)
        undefined, // store (optional)
        'localhost' // hostname
      );
      
      console.log('✅ Successfully added platform via SDK!');
      console.log('Platform:', platform);
    } catch (sdkError) {
      if (sdkError.code === 409) {
        console.log('✅ Platform already exists (SDK confirmed)');
      } else {
        console.error('SDK also failed:', sdkError.message);
        
        // Last resort: provide manual instructions
        console.log('\n📝 Manual Setup Required:');
        console.log('1. Go to: https://nyc.cloud.appwrite.io');
        console.log('2. Navigate to your project: college-football-fantasy-app');
        console.log('3. Go to Settings → Platforms');
        console.log('4. Click "Add Platform" → Choose "Web"');
        console.log('5. Enter hostname: localhost');
        console.log('6. Click "Create platform"');
      }
    }
  }
}

// Run the function
addLocalhostPlatform().then(() => {
  console.log('\n🎯 Next step: Test OAuth again at http://localhost:8789');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
