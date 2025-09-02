#!/usr/bin/env node

// Final attempt to add platform or verify it exists
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

async function checkAndAddPlatform() {
  console.log('🔍 Platform Configuration Check');
  console.log('================================\n');
  
  // Method 1: Try to list current platforms
  console.log('1️⃣ Checking existing platforms...');
  try {
    const listUrl = `${endpoint}/projects/${projectId}/platforms`;
    const listResponse = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey
      }
    });
    
    if (listResponse.ok) {
      const data = await listResponse.json();
      console.log('✅ Successfully retrieved platforms!');
      
      if (data.platforms && Array.isArray(data.platforms)) {
        console.log(`Found ${data.platforms.length} platform(s):\n`);
        
        let hasLocalhost = false;
        data.platforms.forEach(p => {
          console.log(`  • ${p.name || p.hostname} (${p.type})`);
          console.log(`    Hostname: ${p.hostname}`);
          console.log(`    ID: ${p.$id}\n`);
          
          if (p.hostname === 'localhost' || p.hostname?.includes('localhost')) {
            hasLocalhost = true;
          }
        });
        
        if (hasLocalhost) {
          console.log('🎉 Great! localhost is already configured!');
          console.log('OAuth should work at: http://localhost:8789\n');
          return true;
        } else {
          console.log('⚠️  localhost not found in platforms\n');
        }
      }
    } else {
      const errorText = await listResponse.text();
      console.log('Could not list platforms:', errorText);
    }
  } catch (error) {
    console.log('Error checking platforms:', error.message);
  }
  
  // Method 2: Try to add platform
  console.log('\n2️⃣ Attempting to add localhost platform...');
  try {
    const addUrl = `${endpoint}/projects/${projectId}/platforms`;
    const addResponse = await fetch(addUrl, {
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
    
    const responseText = await addResponse.text();
    
    if (addResponse.ok) {
      console.log('✅ Successfully added localhost platform!');
      const data = JSON.parse(responseText);
      console.log('Platform details:', data);
      return true;
    } else if (addResponse.status === 409) {
      console.log('✅ Platform already exists (409 conflict)');
      return true;
    } else {
      console.log('Could not add platform:', addResponse.status, responseText);
    }
  } catch (error) {
    console.log('Error adding platform:', error.message);
  }
  
  // Method 3: Check if OAuth works anyway
  console.log('\n3️⃣ Testing if OAuth works despite platform issues...');
  console.log('The OAuth might still work if:');
  console.log('  • Wildcard domain is configured (*.vercel.app)');
  console.log('  • Platform restrictions are disabled');
  console.log('  • localhost was added through the console\n');
  
  console.log('📝 Manual Setup (if needed):');
  console.log('----------------------------');
  console.log('1. Go to: https://nyc.cloud.appwrite.io');
  console.log('2. Login and navigate to your project');
  console.log('3. Go to Settings → Platforms');
  console.log('4. Add Web platform with hostname: localhost\n');
  
  console.log('🧪 Test OAuth now at: http://localhost:8789');
  console.log('   Even if platform setup failed, OAuth might work!\n');
  
  return false;
}

// Also check OAuth provider status
async function checkOAuthProvider() {
  console.log('4️⃣ Checking Google OAuth provider status...');
  try {
    // Try to get auth methods
    const authUrl = `${endpoint}/projects/${projectId}/auth`;
    const authResponse = await fetch(authUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey
      }
    });
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('Auth configuration retrieved');
      
      // Check if Google OAuth is enabled
      if (authData.authProviders?.google || authData.oAuthProviders?.google) {
        console.log('✅ Google OAuth is enabled');
      }
    }
  } catch (error) {
    console.log('Could not check OAuth provider:', error.message);
  }
}

// Run checks
checkAndAddPlatform().then(async (success) => {
  await checkOAuthProvider();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 NEXT STEPS:');
  console.log('='.repeat(50));
  console.log('1. Go to http://localhost:8789');
  console.log('2. Click "Try Token Flow"');
  console.log('3. Complete Google login');
  console.log('4. Check if you receive userId and secret\n');
  
  if (!success) {
    console.log('If OAuth still fails, manually add platform at:');
    console.log('https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/platforms\n');
  }
});
