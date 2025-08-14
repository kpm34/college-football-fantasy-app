#!/usr/bin/env node

/**
 * Script to rotate Appwrite API key after exposure
 * Run this IMMEDIATELY to invalidate the exposed key
 */

const { Client, Users } = require('node-appwrite');

console.log('🔐 Appwrite API Key Rotation Script');
console.log('====================================\n');

console.log('⚠️  CRITICAL SECURITY STEPS:');
console.log('1. Log into Appwrite Console: https://cloud.appwrite.io');
console.log('2. Go to your project: college-football-fantasy-app');
console.log('3. Navigate to Settings → API Keys');
console.log('4. DELETE the exposed key ending in: ...3db8186b');
console.log('5. Create a NEW API key with the same scopes');
console.log('6. Copy the new key\n');

console.log('📝 Required Scopes for the new key:');
console.log('- databases.read');
console.log('- databases.write');
console.log('- collections.read');
console.log('- collections.write');
console.log('- documents.read');
console.log('- documents.write');
console.log('- functions.read');
console.log('- functions.write\n');

console.log('🔧 After creating the new key:');
console.log('1. Update .env.local with the new APPWRITE_API_KEY');
console.log('2. Add to GitHub Secrets (see instructions below)');
console.log('3. Update Vercel environment variables\n');

console.log('📋 GitHub Secrets Setup (with 2FA):');
console.log('1. Go to: https://github.com/YOUR_USERNAME/college-football-fantasy-app/settings/secrets/actions');
console.log('2. You\'ll need to authenticate with 2FA');
console.log('3. Click "New repository secret"');
console.log('4. Add these secrets:');
console.log('   - Name: APPWRITE_API_KEY');
console.log('     Value: [your new API key]');
console.log('   - Name: APPWRITE_ENDPOINT');
console.log('     Value: https://nyc.cloud.appwrite.io/v1');
console.log('   - Name: APPWRITE_PROJECT_ID');
console.log('     Value: college-football-fantasy-app');
console.log('   - Name: CFBD_API_KEY');
console.log('     Value: [move the exposed CFBD key here]');
console.log('\n');

// Test if we can connect with current credentials
async function testConnection() {
  console.log('🧪 Testing current Appwrite connection...\n');
  
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const users = new Users(client);
    
    // Try a simple API call
    await users.list({ limit: 1 });
    
    console.log('✅ Current API key is still valid');
    console.log('⚠️  ROTATE IT IMMEDIATELY!\n');
  } catch (error) {
    if (error.code === 401) {
      console.log('❌ Current API key is invalid (good if you already rotated it)');
    } else {
      console.log('❌ Connection error:', error.message);
    }
  }
}

// Run the test
testConnection();

console.log('\n🛡️  Security Best Practices:');
console.log('- NEVER commit API keys to git (even in private repos)');
console.log('- Use environment variables for all secrets');
console.log('- Rotate keys immediately if exposed');
console.log('- Use GitHub Secrets for CI/CD workflows');
console.log('- Enable 2FA on all accounts (which you already have! ✅)');
console.log('- Review access logs in Appwrite for any suspicious activity\n');
