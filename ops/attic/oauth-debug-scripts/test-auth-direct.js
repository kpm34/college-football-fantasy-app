#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { Client, Account, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const account = new Account(client);

async function testAuth() {
  console.log('Testing Appwrite Authentication Directly\n');
  
  // Test 1: Create a test user
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log('1. Creating test user...');
    const user = await account.create(
      ID.unique(),
      testEmail,
      testPassword,
      'Test User'
    );
    console.log('✅ User created:', user.$id);
    
    // Test 2: Login with email
    console.log('\n2. Testing email login...');
    const session = await account.createEmailPasswordSession(testEmail, testPassword);
    console.log('✅ Session created:', session.$id);
    
    // Test 3: Get current user
    console.log('\n3. Getting current user...');
    const currentUser = await account.get();
    console.log('✅ Current user:', currentUser.email);
    
    // Test 4: OAuth providers list
    console.log('\n4. Checking OAuth providers...');
    try {
      const providers = await account.listOAuth2Sessions();
      console.log('OAuth sessions:', providers);
    } catch (e) {
      console.log('No OAuth sessions');
    }
    
    // Test 5: Delete session
    console.log('\n5. Cleaning up...');
    await account.deleteSession('current');
    console.log('✅ Session deleted');
    
    console.log('\n✅ ALL TESTS PASSED - Appwrite auth is working correctly');
    console.log('\nNow testing OAuth URL generation...');
    
    // Generate OAuth URL
    const oauthUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/account/sessions/oauth2/google?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}&success=${encodeURIComponent('https://cfbfantasy.app')}&failure=${encodeURIComponent('https://cfbfantasy.app')}`;
    
    console.log('\nOAuth URL that SHOULD work:');
    console.log(oauthUrl);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Response:', error.response);
  }
}

testAuth();
