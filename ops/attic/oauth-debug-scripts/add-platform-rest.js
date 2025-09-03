#!/usr/bin/env node

// Add localhost platform using REST API with correct headers
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!endpoint || !projectId || !apiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

async function addPlatformViaREST() {
  console.log('🔧 Adding localhost platform via REST API...');
  console.log('Project:', projectId);
  console.log('Endpoint:', endpoint);
  console.log('API Key:', apiKey.substring(0, 20) + '...');
  console.log('');
  
  // First, let's check if we can access the project at all
  console.log('1️⃣ Testing API access to project...');
  try {
    const testResponse = await fetch(`${endpoint}/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    const testText = await testResponse.text();
    console.log('Project access response:', testResponse.status);
    
    if (testResponse.ok) {
      const project = JSON.parse(testText);
      console.log('✅ Can access project:', project.name);
      console.log('Project ID confirmed:', project.$id);
    } else {
      console.log('❌ Cannot access project:', testText);
      
      // Try without project header
      console.log('\n2️⃣ Trying console API approach...');
      const consoleResponse = await fetch(`${endpoint}/console/projects/${projectId}`, {
        method: 'GET',
        headers: {
          'X-Appwrite-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (consoleResponse.ok) {
        console.log('✅ Console API works!');
      } else {
        console.log('Console API also failed:', await consoleResponse.text());
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
  
  // Now try to add the platform
  console.log('\n3️⃣ Attempting to add localhost platform...');
  
  // Try different API endpoints
  const endpoints = [
    {
      name: 'Standard API',
      url: `${endpoint}/projects/${projectId}/platforms`,
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Console API',
      url: `${endpoint}/console/projects/${projectId}/platforms`,
      headers: {
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json'
      }
    }
  ];
  
  for (const ep of endpoints) {
    console.log(`\nTrying ${ep.name}...`);
    try {
      const response = await fetch(ep.url, {
        method: 'POST',
        headers: ep.headers,
        body: JSON.stringify({
          type: 'web',
          name: 'localhost',
          hostname: 'localhost'
        })
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        console.log(`✅ Success with ${ep.name}!`);
        const platform = JSON.parse(responseText);
        console.log('Platform created:', platform);
        return true;
      } else if (response.status === 409) {
        console.log(`✅ Platform already exists (${ep.name})`);
        return true;
      } else {
        console.log(`❌ ${ep.name} failed:`, response.status, responseText);
      }
    } catch (error) {
      console.log(`❌ ${ep.name} error:`, error.message);
    }
  }
  
  // If all else fails, provide manual instructions
  console.log('\n❌ Could not add platform programmatically');
  console.log('\n📝 Manual Setup Required:');
  console.log('========================');
  console.log('Since the API is not accepting our requests, you need to:');
  console.log('');
  console.log('1. Open Appwrite Console in your browser');
  console.log('2. Go to Settings → Platforms');
  console.log('3. Click "Add Platform"');
  console.log('4. Select "Web App"');
  console.log('5. Enter hostname: localhost');
  console.log('6. Save');
  console.log('');
  console.log('This is a one-time setup that takes 30 seconds.');
  console.log('');
  console.log('🔍 Debug Info:');
  console.log('The API key has all scopes but platform management might require');
  console.log('console-level access that regular API keys don\'t have.');
  
  return false;
}

addPlatformViaREST().then(success => {
  if (success) {
    console.log('\n🎯 Test OAuth at: http://localhost:8791');
  } else {
    console.log('\n⚠️  After adding localhost manually, test at: http://localhost:8791');
  }
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
