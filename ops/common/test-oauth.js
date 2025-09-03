#!/usr/bin/env node

/**
 * OAuth Testing Utility
 * Usage: node ops/common/test-oauth.js [google|github|facebook]
 * 
 * Tests OAuth authentication with Appwrite
 */

require('dotenv').config({ path: '.env.local' });

const provider = process.argv[2] || 'google';
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  console.error('❌ Missing environment variables. Check .env.local');
  process.exit(1);
}

const successUrl = 'https://cfbfantasy.app/dashboard';
const failureUrl = 'https://cfbfantasy.app/login?error=oauth_failed';

const oauthUrl = `${endpoint}/account/sessions/oauth2/${provider}?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;

console.log(`
🔐 OAuth Test Utility
====================
Provider: ${provider}
Project: ${projectId}
Endpoint: ${endpoint}

OAuth URL:
${oauthUrl}

Opening browser...
`);

const open = require('open');
open(oauthUrl).catch(() => {
  console.log('Could not open browser. Please visit the URL above manually.');
});
