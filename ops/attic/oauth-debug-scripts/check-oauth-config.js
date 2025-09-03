#!/usr/bin/env node

// Check if Google OAuth is properly configured
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('🔍 OAuth Configuration Check');
console.log('============================\n');

console.log('📋 Checklist for Google OAuth:\n');

console.log('1. ✅ localhost is added as a platform (CONFIRMED)');
console.log('');

console.log('2. ❓ Is Google OAuth enabled in Appwrite?');
console.log('   Go to: Appwrite Console → Auth → Settings');
console.log('   Check if Google OAuth2 is ENABLED (toggle should be ON)');
console.log('');

console.log('3. ❓ Are Google OAuth credentials configured?');
console.log('   In Appwrite Console → Auth → Settings → Google OAuth2:');
console.log('   • App ID (Client ID) should be set');
console.log('   • App Secret (Client Secret) should be set');
console.log('');

console.log('4. ❓ Google Cloud Console Configuration:');
console.log('   In Google Cloud Console for your OAuth app:');
console.log('   • Authorized redirect URIs should include:');
console.log(`     - ${endpoint}/account/sessions/oauth2/callback/google/${projectId}`);
console.log(`     - https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/${projectId}`);
console.log('');

console.log('🔧 How to Enable Google OAuth in Appwrite:');
console.log('==========================================\n');

console.log('Step 1: Enable Google OAuth in Appwrite');
console.log('----------------------------------------');
console.log('1. Go to Appwrite Console');
console.log('2. Navigate to: Auth → Settings');
console.log('3. Find "Google OAuth2" in the list');
console.log('4. Toggle it ON (enabled)');
console.log('5. You\'ll see fields for App ID and App Secret');
console.log('');

console.log('Step 2: Get Google OAuth Credentials');
console.log('-------------------------------------');
console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
console.log('2. Create a new OAuth 2.0 Client ID (or use existing)');
console.log('3. Application type: Web application');
console.log('4. Add Authorized redirect URIs:');
console.log(`   • ${endpoint}/account/sessions/oauth2/callback/google/${projectId}`);
console.log('5. Copy the Client ID and Client Secret');
console.log('');

console.log('Step 3: Configure in Appwrite');
console.log('-----------------------------');
console.log('1. Back in Appwrite Console → Auth → Settings → Google OAuth2');
console.log('2. Paste your Google Client ID in "App ID" field');
console.log('3. Paste your Google Client Secret in "App Secret" field');
console.log('4. Click "Update"');
console.log('');

console.log('📝 Quick Links:');
console.log('==============');
console.log('Appwrite Auth Settings: https://nyc.cloud.appwrite.io/console/project-' + projectId + '/auth/settings');
console.log('Google Cloud Console: https://console.cloud.google.com/apis/credentials');
console.log('');

console.log('⚠️  Most Common Issue:');
console.log('=====================');
console.log('Google OAuth is DISABLED in Appwrite, or the Client ID/Secret are not set.');
console.log('This would cause exactly the behavior you\'re seeing - redirect without credentials.');
console.log('');

// Open Appwrite Auth settings
const open = require('open');
const authUrl = `https://nyc.cloud.appwrite.io/console/project-${projectId}/auth/settings`;

console.log('Opening Appwrite Auth Settings...');
open(authUrl).then(() => {
  console.log('✅ Opened Auth Settings page');
  console.log('   Check if Google OAuth2 is enabled and configured!');
}).catch(() => {
  console.log('Visit:', authUrl);
});
