#!/usr/bin/env node

// Simple script to add localhost platform using REST API with proper headers
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app';

console.log('🔧 Platform Configuration Helper');
console.log('================================');
console.log('');
console.log('Since API key lacks platform.write scope, here are your options:');
console.log('');
console.log('Option 1: Quick Manual Setup (Recommended)');
console.log('-------------------------------------------');
console.log('1. Open: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/settings/platforms');
console.log('2. Click "Add platform" button');
console.log('3. Select "Web" (Next.js icon is fine)');
console.log('4. Enter hostname: localhost');
console.log('5. Click "Create platform"');
console.log('');
console.log('Option 2: Also Add Your Production Domains');
console.log('-------------------------------------------');
console.log('While you\'re there, also add:');
console.log('- cfbfantasy.app');
console.log('- collegefootballfantasy.app');
console.log('- *.vercel.app (for preview deployments)');
console.log('');
console.log('Option 3: Update API Key Permissions');
console.log('--------------------------------------');
console.log('1. Go to API Keys in Appwrite Console');
console.log('2. Edit your current API key');
console.log('3. Add scope: platforms.write');
console.log('4. Save and update APPWRITE_API_KEY in .env.local');
console.log('');
console.log('📝 Current Configuration:');
console.log('Project ID:', projectId);
console.log('Endpoint:', endpoint);
console.log('');
console.log('After adding localhost, test OAuth at: http://localhost:8789');