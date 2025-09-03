#!/usr/bin/env node

const { execSync } = require('child_process');

console.log(`
================================================================================
🔧 GOOGLE OAUTH FIX - COPY & PASTE SOLUTION
================================================================================

The redirect URI in your Google Cloud Console is WRONG!

Current (WRONG):
https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/c

Should be (CORRECT):
https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app

STEPS TO FIX:
1. Click "Add URI" button in Google Cloud Console
2. Copy this EXACT URL and paste it:

https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app

3. Click "Save" at the bottom
4. Wait 5 minutes for Google to propagate changes

================================================================================
`);

// Copy to clipboard
try {
  execSync('echo "https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app" | pbcopy');
  console.log('✅ The correct URL has been COPIED TO YOUR CLIPBOARD!');
  console.log('   Just paste it into the "Add URI" field in Google Cloud Console\n');
} catch (e) {
  console.log('Copy this URL manually:');
  console.log('https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app\n');
}

console.log('After adding the correct URI and saving, test here:');
console.log('https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=college-football-fantasy-app&success=https://cfbfantasy.app&failure=https://cfbfantasy.app\n');
