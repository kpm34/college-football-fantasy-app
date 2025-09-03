#!/usr/bin/env node

// Verify OAuth configuration
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const googleClientId = '856637765305-c3f449jm2lq0duqf5hn4p97k999k410p.apps.googleusercontent.com';

console.log('🔍 OAuth Configuration Verification');
console.log('===================================\n');

console.log('1️⃣ Environment Variables:');
console.log('   Endpoint:', endpoint);
console.log('   Project ID:', projectId);
console.log('');

console.log('2️⃣ Google OAuth Client ID:');
console.log('   ', googleClientId);
console.log('');

console.log('3️⃣ Expected Callback URL in Google Cloud Console:');
console.log('   This EXACT URL must be in your Authorized redirect URIs:');
console.log(`   ${endpoint}/account/sessions/oauth2/callback/google/${projectId}`);
console.log('');
console.log('   Which should be:');
console.log(`   https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app`);
console.log('');

console.log('4️⃣ Verification Checklist:');
console.log('');
console.log('✓ In Google Cloud Console (https://console.cloud.google.com):');
console.log('  □ OAuth 2.0 Client ID matches:', googleClientId);
console.log('  □ Application type: Web application');
console.log('  □ Authorized redirect URIs includes:');
console.log('    https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app');
console.log('  □ OAuth consent screen status: In production (or your email is in test users)');
console.log('');

console.log('✓ In Appwrite Console (https://nyc.cloud.appwrite.io):');
console.log('  □ Auth → Settings → Google OAuth2 is ENABLED');
console.log('  □ App ID field contains:', googleClientId);
console.log('  □ App Secret field contains: Your Client Secret from Google');
console.log('');

console.log('5️⃣ Common Issues to Check:');
console.log('');
console.log('❌ Wrong Project ID:');
console.log('   - Is the project ID in your .env exactly: college-football-fantasy-app ?');
console.log('   - No typos, no extra spaces?');
console.log('');

console.log('❌ Wrong Client ID in Appwrite:');
console.log('   - Did you paste the full Client ID including .apps.googleusercontent.com?');
console.log('   - No extra spaces before or after?');
console.log('');

console.log('❌ Wrong/Missing Client Secret:');
console.log('   - The Client Secret must be copied from Google Cloud Console');
console.log('   - It\'s different from the Client ID');
console.log('   - Usually starts with "GOCSPX-"');
console.log('');

console.log('6️⃣ Test with EXACT values:');
console.log('');

const testUrl = `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent('http://localhost:8797/callback')}&failure=${encodeURIComponent('http://localhost:8797/callback')}`;

console.log('Test URL with your exact configuration:');
console.log(testUrl);
console.log('');

// Create a simple test server
const express = require('express');
const open = require('open');
const app = express();
const port = 8797;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Config Verification</title>
      <style>
        body { font-family: sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; }
        .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .config { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .btn:hover { background: #0056b3; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 12px; }
        .checklist { background: #e7f3ff; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; }
        .error { color: #dc3545; }
        .success { color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 OAuth Configuration Verification</h1>
        
        <div class="config">
          <h3>Your Configuration:</h3>
          <p><strong>Project ID:</strong> <code>${projectId}</code></p>
          <p><strong>Endpoint:</strong> <code>${endpoint}</code></p>
          <p><strong>Google Client ID:</strong><br><code>${googleClientId}</code></p>
        </div>
        
        <div class="checklist">
          <h3>⚠️ Most Common Issue:</h3>
          <p><strong>The project ID might be wrong!</strong></p>
          <p>Double-check that your Appwrite project ID is exactly:</p>
          <p><code>college-football-fantasy-app</code></p>
          <p>You can verify this in Appwrite Console → Project Settings</p>
        </div>
        
        <div class="config">
          <h3>Required Google Cloud Console Settings:</h3>
          <p><strong>Authorized redirect URI (must be EXACT):</strong></p>
          <p><code>https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app</code></p>
          <br>
          <a href="https://console.cloud.google.com/apis/credentials/oauthclient/${googleClientId.split('-')[0]}-${googleClientId.split('-')[1].split('.')[0]}" target="_blank" class="btn">
            Open Your OAuth Client in Google Console →
          </a>
        </div>
        
        <div class="config">
          <h3>Test OAuth with Exact Configuration:</h3>
          <a href="${testUrl}" class="btn" style="background: #28a745;">
            Test OAuth Now →
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/callback', (req, res) => {
  console.log('\n=== OAuth Callback ===');
  console.log('Query:', req.query);
  
  if (req.query.userId && req.query.secret) {
    console.log('✅ SUCCESS! OAuth is working!');
    res.send('<h1 style="color: green;">✅ OAuth Works!</h1><p>Credentials received!</p>');
  } else if (req.query.error) {
    console.log('❌ Error:', req.query.error);
    res.send(`<h1 style="color: red;">❌ Error</h1><p>${req.query.error}</p><p>${req.query.message || ''}</p>`);
  } else {
    console.log('⚠️ No credentials received');
    res.send(`
      <h1>⚠️ No Credentials</h1>
      <p>This usually means one of:</p>
      <ul>
        <li>Wrong project ID in .env</li>
        <li>Client Secret not set in Appwrite</li>
        <li>Callback URL mismatch</li>
      </ul>
      <p>Check the terminal for details.</p>
    `);
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Verification Server Running`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log('\nOpening browser...\n');
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
