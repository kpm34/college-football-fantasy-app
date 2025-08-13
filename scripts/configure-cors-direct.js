#!/usr/bin/env node

const https = require('https');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error('❌ Missing APPWRITE_API_KEY');
  console.error('\nPlease add your Appwrite API key to the .env file');
  console.error('\nTo get an API key:');
  console.error('1. Go to https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/api');
  console.error('2. Create a new API key with these scopes:');
  console.error('   - projects.read');
  console.error('   - projects.write');
  console.error('3. Add to .env as APPWRITE_API_KEY=your_key_here');
  process.exit(1);
}

const platforms = [
  { hostname: 'cfbfantasy.app', name: 'CFB Fantasy Main' },
  { hostname: 'www.cfbfantasy.app', name: 'CFB Fantasy WWW' },
  { hostname: 'collegefootballfantasy.app', name: 'College Football Fantasy Main' },
  { hostname: 'www.collegefootballfantasy.app', name: 'College Football Fantasy WWW' },
  { hostname: '*.vercel.app', name: 'Vercel Preview' },
  { hostname: 'localhost', name: 'Localhost' },
  { hostname: 'localhost:3000', name: 'Localhost 3000' },
  { hostname: 'localhost:3001', name: 'Localhost 3001' }
];

async function makeRequest(path, method = 'GET', data = null) {
  const url = new URL(path, APPWRITE_ENDPOINT);
  
  const options = {
    method,
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function configurePlatforms() {
  console.log('🔧 Configuring Appwrite CORS for production domains...\n');

  try {
    // First, get existing platforms
    console.log('Fetching existing platforms...');
    const existingPlatforms = await makeRequest(`/projects/${PROJECT_ID}/platforms`);
    const existingHostnames = new Set(existingPlatforms.platforms.map(p => p.hostname));

    for (const platform of platforms) {
      if (existingHostnames.has(platform.hostname)) {
        console.log(`⚠️  Platform already exists: ${platform.hostname}`);
        continue;
      }

      try {
        const platformId = platform.hostname.replace(/[^a-zA-Z0-9]/g, '-');
        
        await makeRequest(`/projects/${PROJECT_ID}/platforms`, 'POST', {
          type: 'web',
          name: platform.name,
          hostname: platform.hostname,
          platformId: platformId
        });
        
        console.log(`✅ Added platform: ${platform.hostname}`);
      } catch (error) {
        console.error(`❌ Error adding ${platform.hostname}:`, error.message || error);
      }
    }

    console.log('\n✨ Configuration complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Clear your browser cache');
    console.log('2. Visit https://cfbfantasy.app');
    console.log('3. The CORS errors should be resolved');

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 401) {
      console.error('\n🔑 Authentication Error');
      console.error('Your API key might not have the correct permissions.');
      console.error('Make sure it has "projects.write" scope.');
    }
  }
}

configurePlatforms();
