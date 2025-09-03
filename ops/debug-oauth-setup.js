#!/usr/bin/env node

/**
 * Debug script to verify OAuth configuration in Appwrite
 * Run with: node ops/debug-oauth-setup.js
 */

import { Client, Account } from 'appwrite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || 'college-football-fantasy-app';

console.log('🔍 OAuth Configuration Debugger\n');
console.log('📋 Environment:');
console.log(`   Endpoint: ${endpoint}`);
console.log(`   Project ID: ${projectId}`);
console.log(`   Current URL: https://cfbfantasy.app\n`);

// Initialize client
const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

const account = new Account(client);

console.log('✅ Appwrite client initialized\n');

console.log('📌 Required OAuth Redirect URIs for Google Cloud Console:');
console.log('   Production:');
console.log(`   - ${endpoint}/account/sessions/oauth2/callback/google/${projectId}`);
console.log('   - https://cfbfantasy.app/oauth-handler.html');
console.log('   - https://cfbfantasy.app/dashboard');
console.log('   \n   Local Development:');
console.log('   - http://localhost:3001/oauth-handler.html');
console.log('   - http://localhost:3001/dashboard\n');

console.log('⚙️  Google Cloud Console Configuration:');
console.log('   1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('   2. Select your OAuth 2.0 Client ID');
console.log('   3. Add the redirect URIs listed above to "Authorized redirect URIs"');
console.log('   4. Save the changes\n');

console.log('🔧 Appwrite Console Configuration:');
console.log('   1. Go to: https://cloud.appwrite.io/console/project-college-football-fantasy-app/auth/settings');
console.log('   2. Enable Google OAuth provider');
console.log('   3. Add your Google Client ID and Secret');
console.log('   4. Set Success URL: https://cfbfantasy.app/dashboard');
console.log('   5. Set Failure URL: https://cfbfantasy.app/login?error=oauth_failed\n');

console.log('🧪 Testing OAuth URL Generation...');
try {
    // Generate the OAuth URL (for testing purposes only)
    const successUrl = 'https://cfbfantasy.app/oauth-handler.html';
    const failureUrl = 'https://cfbfantasy.app/login?error=oauth_failed';
    
    console.log('\n📝 OAuth URLs that will be used:');
    console.log(`   Success: ${successUrl}`);
    console.log(`   Failure: ${failureUrl}`);
    
    // The actual OAuth URL that Appwrite will redirect to Google
    const googleOAuthUrl = `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
    
    console.log('\n🔗 Direct OAuth URL (for manual testing):');
    console.log(`   ${googleOAuthUrl}`);
    
    console.log('\n✅ Configuration check complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Verify the redirect URIs are added in Google Cloud Console');
    console.log('   2. Deploy the CSP fix with: vercel --prod');
    console.log('   3. Test the OAuth flow again');
    console.log('   4. Check browser console for detailed debug logs');
    
} catch (error) {
    console.error('\n❌ Error during configuration check:', error);
}

process.exit(0);