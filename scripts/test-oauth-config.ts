#!/usr/bin/env tsx
/**
 * Test OAuth configuration and debug issues
 */

import { Client, Account } from 'node-appwrite';

const client = new Client();

client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('college-football-fantasy-app');

const account = new Account(client);

async function testOAuthConfig() {
  console.log('🔍 Testing OAuth Configuration...\n');
  
  try {
    // Test 1: Check if we can reach Appwrite
    console.log('1️⃣ Testing Appwrite connection...');
    const response = await fetch('https://nyc.cloud.appwrite.io/v1/health/version', {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Appwrite is reachable, version:', data.version);
    } else {
      console.log('   ❌ Cannot reach Appwrite');
    }
    
    // Test 2: Check OAuth provider status
    console.log('\n2️⃣ Checking OAuth providers configuration...');
    console.log('   ℹ️  Note: Provider status can only be fully verified through the Console');
    console.log('   📍 Check at: https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/auth/settings');
    
    // Test 3: Generate OAuth URLs for debugging
    console.log('\n3️⃣ OAuth URLs for debugging:');
    const successUrl = 'https://cfbfantasy.app/api/auth/oauth/success';
    const failureUrl = 'https://cfbfantasy.app/login?error=oauth_failed';
    
    console.log('   Success URL:', successUrl);
    console.log('   Failure URL:', failureUrl);
    console.log('   Callback URL (for Google Console):');
    console.log('   https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app');
    
    // Test 4: Check environment variables
    console.log('\n4️⃣ Environment Variables Check:');
    console.log('   NEXT_PUBLIC_APPWRITE_ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'Not set (using default)');
    console.log('   NEXT_PUBLIC_APPWRITE_PROJECT_ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not set (using default)');
    console.log('   NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE:', process.env.NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE || 'Not set');
    
    console.log('\n📋 Checklist for OAuth to work:');
    console.log('   1. Google OAuth enabled in Appwrite Console');
    console.log('   2. Google Client ID added to Appwrite');
    console.log('   3. Google Client Secret added to Appwrite');
    console.log('   4. Callback URI added to Google Console (exact match)');
    console.log('   5. Google+ API enabled in Google Console');
    console.log('   6. OAuth credentials not expired/revoked');
    
    console.log('\n🔗 Direct test link:');
    console.log('   https://cfbfantasy.app/login');
    console.log('   Click "Continue with Google" and check browser console for errors');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testOAuthConfig();
