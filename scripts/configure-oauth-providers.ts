#!/usr/bin/env npx tsx
/**
 * Configure OAuth Providers for Appwrite
 * 
 * This script helps configure Google and Apple OAuth providers
 * for the College Football Fantasy App
 */

import { Client, Account } from 'node-appwrite';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config({ path: '.env.local' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function configureOAuthProviders() {
  console.log('🔐 OAuth Provider Configuration for College Football Fantasy App\n');
  console.log('This script will help you configure Google and Apple OAuth providers.');
  console.log('You need to set these up manually in the Appwrite Console.\n');
  
  console.log('📋 Required Information:\n');
  
  console.log('For Google OAuth:');
  console.log('1. Go to https://console.cloud.google.com/');
  console.log('2. Create or select a project');
  console.log('3. Enable Google+ API');
  console.log('4. Create OAuth 2.0 credentials');
  console.log('5. Add authorized redirect URIs:');
  console.log('   - https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app');
  console.log('   - https://cfbfantasy.app/api/auth/oauth/callback');
  console.log('   - https://collegefootballfantasy.app/api/auth/oauth/callback\n');
  
  const googleClientId = await question('Enter Google Client ID (or press Enter to skip): ');
  const googleClientSecret = await question('Enter Google Client Secret (or press Enter to skip): ');
  
  console.log('\nFor Apple OAuth:');
  console.log('1. Go to https://developer.apple.com/');
  console.log('2. Create an App ID with Sign in with Apple capability');
  console.log('3. Create a Service ID');
  console.log('4. Create a Key for Sign in with Apple');
  console.log('5. Configure redirect URLs:');
  console.log('   - https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/apple/college-football-fantasy-app');
  console.log('   - https://cfbfantasy.app/api/auth/oauth/callback');
  console.log('   - https://collegefootballfantasy.app/api/auth/oauth/callback\n');
  
  const appleServiceId = await question('Enter Apple Service ID (or press Enter to skip): ');
  const appleTeamId = await question('Enter Apple Team ID (or press Enter to skip): ');
  const appleKeyId = await question('Enter Apple Key ID (or press Enter to skip): ');
  const applePrivateKey = await question('Enter Apple Private Key (paste multi-line, then press Enter twice): ');
  
  console.log('\n📝 Configuration Summary:\n');
  
  if (googleClientId && googleClientSecret) {
    console.log('✅ Google OAuth configured');
    console.log(`   Client ID: ${googleClientId.substring(0, 20)}...`);
  } else {
    console.log('⏭️  Google OAuth skipped');
  }
  
  if (appleServiceId && appleTeamId && appleKeyId) {
    console.log('✅ Apple OAuth configured');
    console.log(`   Service ID: ${appleServiceId}`);
    console.log(`   Team ID: ${appleTeamId}`);
  } else {
    console.log('⏭️  Apple OAuth skipped');
  }
  
  console.log('\n🔧 Next Steps:\n');
  console.log('1. Go to https://nyc.cloud.appwrite.io');
  console.log('2. Navigate to your project: college-football-fantasy-app');
  console.log('3. Go to Auth → Settings → OAuth2 Providers');
  console.log('4. Enable and configure the providers with the credentials above');
  console.log('5. Update your .env.local file:');
  
  console.log('\n# Add to .env.local:');
  if (googleClientId) {
    console.log('NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE=true');
    console.log(`GOOGLE_CLIENT_ID=${googleClientId}`);
    console.log(`GOOGLE_CLIENT_SECRET=${googleClientSecret}`);
  }
  if (appleServiceId) {
    console.log('NEXT_PUBLIC_ENABLE_OAUTH_APPLE=true');
    console.log(`APPLE_SERVICE_ID=${appleServiceId}`);
    console.log(`APPLE_TEAM_ID=${appleTeamId}`);
    console.log(`APPLE_KEY_ID=${appleKeyId}`);
  }
  
  console.log('\n✨ Configuration complete! Remember to configure these in the Appwrite Console.');
  
  rl.close();
}

// Run the configuration
configureOAuthProviders().catch(console.error);
