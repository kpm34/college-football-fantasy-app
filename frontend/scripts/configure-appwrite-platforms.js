#!/usr/bin/env node

const { Client, Projects } = require('node-appwrite');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
  .setKey(process.env.APPWRITE_API_KEY); // You need an API key with project.write scope

const projects = new Projects(client);

const PRODUCTION_DOMAINS = [
  'cfbfantasy.app',
  'www.cfbfantasy.app',
  'collegefootballfantasy.app',
  'www.collegefootballfantasy.app',
  '*.vercel.app',
  'localhost',
  'localhost:3000',
  'localhost:3001'
];

async function addPlatforms() {
  try {
    console.log('Adding production domains to Appwrite project...\n');
    
    for (const hostname of PRODUCTION_DOMAINS) {
      try {
        // Create a web platform
        await projects.createPlatform(
          process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app',
          'web',
          hostname.replace(/[^a-zA-Z0-9]/g, '-'), // Platform ID (alphanumeric only)
          hostname,
          '', // No specific key for web platforms
          '', // No store for web platforms
          hostname // Use hostname as the name
        );
        
        console.log(`✅ Added platform: ${hostname}`);
      } catch (error) {
        if (error.code === 409) {
          console.log(`⚠️  Platform already exists: ${hostname}`);
        } else {
          console.error(`❌ Error adding platform ${hostname}:`, error.message);
        }
      }
    }
    
    console.log('\n✨ Platform configuration complete!');
    console.log('\nNote: Clear your browser cache and try accessing the site again.');
    
  } catch (error) {
    console.error('Error configuring platforms:', error);
    
    if (error.code === 401) {
      console.error('\n❌ Authentication Error: You need an API key with project.write scope');
      console.error('\nTo create an API key:');
      console.error('1. Go to https://nyc.cloud.appwrite.io/console');
      console.error('2. Navigate to your project');
      console.error('3. Go to Settings → API Keys');
      console.error('4. Create a new API key with "projects.write" scope');
      console.error('5. Add it to your .env file as APPWRITE_API_KEY');
    }
  }
}

// Check if we have an API key
if (!process.env.APPWRITE_API_KEY) {
  console.error('❌ Missing APPWRITE_API_KEY in environment variables');
  console.error('\nTo create an API key:');
  console.error('1. Go to https://nyc.cloud.appwrite.io/console');
  console.error('2. Navigate to your project');
  console.error('3. Go to Settings → API Keys');
  console.error('4. Create a new API key with "projects.write" scope');
  console.error('5. Add it to your .env file as APPWRITE_API_KEY');
  process.exit(1);
}

addPlatforms();
