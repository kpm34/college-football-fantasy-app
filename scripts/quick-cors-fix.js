#!/usr/bin/env node

const https = require('https');

// Configuration from your appwrite-config.ts
const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID = 'college-football-fantasy-app';
const API_KEY = 'standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891';

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
    // First, try to get project info to verify API key works
    console.log('Verifying API access...');
    try {
      const project = await makeRequest(`/projects/${PROJECT_ID}`);
      console.log(`✅ Connected to project: ${project.name}\n`);
    } catch (error) {
      if (error.code === 401) {
        console.error('❌ API Key authentication failed');
        console.error('The API key might not have the correct permissions.');
        console.error('\nTo fix this:');
        console.error('1. Go to https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/api');
        console.error('2. Create a new API key with "projects.write" scope');
        console.error('3. Replace the API_KEY in this script');
        process.exit(1);
      }
      throw error;
    }

    // Get existing platforms
    console.log('Fetching existing platforms...');
    const existingPlatforms = await makeRequest(`/projects/${PROJECT_ID}/platforms`);
    const existingHostnames = new Set(existingPlatforms.platforms.map(p => p.hostname));
    
    console.log(`Found ${existingPlatforms.platforms.length} existing platforms\n`);

    for (const platform of platforms) {
      if (existingHostnames.has(platform.hostname)) {
        console.log(`⚠️  Platform already exists: ${platform.hostname}`);
        continue;
      }

      try {
        const platformId = 'web-' + platform.hostname.replace(/[^a-zA-Z0-9]/g, '-');
        
        await makeRequest(`/projects/${PROJECT_ID}/platforms`, 'POST', {
          type: 'web',
          name: platform.name,
          hostname: platform.hostname,
          platformId: platformId
        });
        
        console.log(`✅ Added platform: ${platform.hostname}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Platform already exists: ${platform.hostname}`);
        } else {
          console.error(`❌ Error adding ${platform.hostname}:`, error.message || error);
        }
      }
    }

    console.log('\n✨ Configuration complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Clear your browser cache (Cmd+Shift+R or Ctrl+Shift+R)');
    console.log('2. Visit https://cfbfantasy.app');
    console.log('3. The CORS errors should be resolved!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

configurePlatforms();
