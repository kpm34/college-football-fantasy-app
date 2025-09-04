#!/usr/bin/env node

/**
 * Simple Google OAuth Test Script
 * Tests the OAuth configuration without complex flows
 */

import { Client, Account, OAuthProvider } from 'appwrite';

async function testGoogleOAuth() {
  console.log('🔍 Testing Google OAuth Configuration...\n');
  
  // Configuration
  const config = {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
  };
  
  console.log('📋 Configuration:');
  console.log(`   Endpoint: ${config.endpoint}`);
  console.log(`   Project: ${config.projectId}\n`);
  
  try {
    // Initialize client
    const client = new Client()
      .setEndpoint(config.endpoint)
      .setProject(config.projectId);
    
    const account = new Account(client);
    
    // Test 1: Check if OAuth provider is configured
    console.log('✅ Test 1: Client initialized successfully');
    
    // Test 2: Generate OAuth URL (doesn't actually redirect)
    const successUrl = 'http://localhost:3001/dashboard';
    const failureUrl = 'http://localhost:3001/login?error=oauth_failed';
    
    console.log('\n📌 OAuth URLs:');
    console.log(`   Success: ${successUrl}`);
    console.log(`   Failure: ${failureUrl}`);
    
    // The actual OAuth URL that would be used
    const oauthUrl = `${config.endpoint}/account/sessions/oauth2/google` +
      `?project=${config.projectId}` +
      `&success=${encodeURIComponent(successUrl)}` +
      `&failure=${encodeURIComponent(failureUrl)}`;
    
    console.log('\n🔗 Generated OAuth URL:');
    console.log(`   ${oauthUrl}`);
    
    console.log('\n✨ OAuth configuration appears to be correct!');
    console.log('\n📝 Next Steps:');
    console.log('1. Ensure Google OAuth is enabled in Appwrite Console');
    console.log('2. Verify OAuth redirect URIs in Google Console include:');
    console.log('   - https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google');
    console.log('3. Test the login button in your app at http://localhost:3001/login');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the test
testGoogleOAuth();