#!/usr/bin/env node

const { Client, Projects } = require('appwrite');

// Initialize Appwrite client
const client = new Client();

// Use the configuration from your appwrite-config.ts
client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app')
  .setKey('standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891');

const projects = new Projects(client);

const platforms = [
  { hostname: 'cfbfantasy.app', name: 'CFB Fantasy Main' },
  { hostname: 'www.cfbfantasy.app', name: 'CFB Fantasy WWW' },
  { hostname: 'collegefootballfantasy.app', name: 'College Football Fantasy' },
  { hostname: 'www.collegefootballfantasy.app', name: 'College Football Fantasy WWW' },
  { hostname: 'localhost', name: 'Localhost' },
  { hostname: 'localhost:3000', name: 'Localhost 3000' },
  { hostname: 'localhost:3001', name: 'Localhost 3001' }
];

async function setupPlatforms() {
  console.log('🔧 Setting up Appwrite CORS for production domains...\n');

  try {
    // Get current project info
    const project = await projects.get('college-football-fantasy-app');
    console.log(`✅ Connected to project: ${project.name}\n`);

    // Get existing platforms
    const existingPlatforms = await projects.listPlatforms('college-football-fantasy-app');
    const existingHostnames = existingPlatforms.platforms.map(p => p.hostname);
    
    console.log(`Found ${existingPlatforms.total} existing platforms:`);
    existingHostnames.forEach(h => console.log(`  - ${h}`));
    console.log('');

    // Add new platforms
    for (const platform of platforms) {
      if (existingHostnames.includes(platform.hostname)) {
        console.log(`⚠️  Platform already exists: ${platform.hostname}`);
        continue;
      }

      try {
        const platformId = platform.hostname.replace(/[^a-zA-Z0-9]/g, '').substring(0, 36);
        
        await projects.createPlatform(
          'college-football-fantasy-app',
          'web',
          platform.name,
          '', // key (not needed for web)
          '', // store (not needed for web)  
          platform.hostname
        );
        
        console.log(`✅ Added platform: ${platform.hostname}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Platform already configured: ${platform.hostname}`);
        } else {
          console.error(`❌ Error adding ${platform.hostname}:`, error.message);
        }
      }
    }

    // Also add wildcard for Vercel previews
    try {
      await projects.createPlatform(
        'college-football-fantasy-app',
        'web',
        'Vercel Previews',
        '',
        '',
        '*.vercel.app'
      );
      console.log(`✅ Added platform: *.vercel.app`);
    } catch (error) {
      if (error.code !== 409) {
        console.error(`❌ Error adding *.vercel.app:`, error.message);
      }
    }

    console.log('\n✨ CORS configuration complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Clear your browser cache');
    console.log('2. Open DevTools → Application → Clear storage');
    console.log('3. Visit https://cfbfantasy.app');
    console.log('4. The CORS errors should now be resolved!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === 401) {
      console.error('\n🔐 Authentication Error');
      console.error('The API key doesn\'t have the necessary permissions.');
      console.error('\nTo create a new API key with correct permissions:');
      console.error('1. Go to https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app');
      console.error('2. Navigate to Settings → API Keys');
      console.error('3. Create a new key with "projects.write" scope');
      console.error('4. Update the API key in this script');
    } else if (error.code === 404) {
      console.error('\n🔍 Project Not Found');
      console.error('Make sure the project ID is correct: college-football-fantasy-app');
    }
  }
}

setupPlatforms().catch(console.error);
