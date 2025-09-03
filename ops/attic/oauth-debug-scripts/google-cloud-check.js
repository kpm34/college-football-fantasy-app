#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');
const app = express();
const port = 8799;

const clientId = '856637765305-c3f449jm2lq0duqf5hn4p97k999k410p.apps.googleusercontent.com';
const projectNumber = '856637765305';
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('🔍 Google Cloud Console Configuration Check');
console.log('===========================================\n');

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google Cloud Console Check</title>
      <style>
        body { font-family: sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid #4285f4; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        .critical { background: #ffebee; border-left: 4px solid #f44336; padding: 20px; margin: 20px 0; }
        .info { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0; }
        .success { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; }
        code { background: #f5f5f5; padding: 3px 8px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 14px; display: inline-block; margin: 2px 0; }
        .code-block { background: #263238; color: #aed581; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 15px 0; }
        .btn { display: inline-block; padding: 12px 24px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px; margin: 10px 10px 10px 0; }
        .btn:hover { background: #357ae8; }
        .btn-secondary { background: #757575; }
        .btn-secondary:hover { background: #616161; }
        .step { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .step h3 { margin-top: 0; color: #333; }
        ol { padding-left: 20px; }
        li { margin: 10px 0; }
        .exact-url { background: #fff9c4; padding: 15px; border: 2px dashed #f9a825; border-radius: 8px; margin: 20px 0; word-break: break-all; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 Google Cloud Console Configuration Check</h1>
        
        <div class="critical">
          <h2>⚠️ CRITICAL: The Issue</h2>
          <p>OAuth is not returning credentials. This usually means:</p>
          <ol>
            <li><strong>The redirect URI in Google Cloud Console doesn't match EXACTLY</strong></li>
            <li><strong>The OAuth consent screen is in "Testing" mode and you're not a test user</strong></li>
            <li><strong>The Client Secret in Appwrite doesn't match Google's</strong></li>
          </ol>
        </div>

        <div class="step">
          <h3>Step 1: Open Google Cloud Console</h3>
          <p>Click the button below to open your OAuth 2.0 Client settings:</p>
          <a href="https://console.cloud.google.com/apis/credentials/oauthclient/${projectNumber}-c3f449jm2lq0duqf5hn4p97k999k410p.apps.googleusercontent.com?project=${projectNumber}" target="_blank" class="btn">
            Open OAuth Client Settings →
          </a>
        </div>

        <div class="step">
          <h3>Step 2: Verify Authorized Redirect URIs</h3>
          <p>Make sure this EXACT URL is in your "Authorized redirect URIs" list:</p>
          <div class="exact-url">
            https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app
          </div>
          <p><strong>⚠️ IMPORTANT:</strong> It must match EXACTLY - no trailing slashes, no http instead of https, no typos!</p>
        </div>

        <div class="step">
          <h3>Step 3: Check OAuth Consent Screen</h3>
          <a href="https://console.cloud.google.com/apis/credentials/consent?project=${projectNumber}" target="_blank" class="btn btn-secondary">
            Open OAuth Consent Screen →
          </a>
          <p>Check the <strong>Publishing status</strong>:</p>
          <ul>
            <li>If it says <strong>"Testing"</strong>: You need to add your email as a test user</li>
            <li>If it says <strong>"In production"</strong>: It should work for everyone</li>
          </ul>
        </div>

        <div class="step">
          <h3>Step 4: Copy the Client Secret</h3>
          <p>In the OAuth 2.0 Client ID page, copy the <strong>Client secret</strong> (not the Client ID).</p>
          <p>It should look like: <code>GOCSPX-xxxxxxxxxxxxx</code></p>
        </div>

        <div class="step">
          <h3>Step 5: Update Appwrite</h3>
          <a href="https://nyc.cloud.appwrite.io/console/project-${projectId}/auth/security" target="_blank" class="btn">
            Open Appwrite Auth Settings →
          </a>
          <p>Go to <strong>Settings → Google OAuth2</strong> and verify:</p>
          <ul>
            <li><strong>App ID:</strong> <code>${clientId}</code></li>
            <li><strong>App Secret:</strong> The Client Secret you copied from Google</li>
          </ul>
        </div>

        <div class="info">
          <h3>🔧 Quick Fix Checklist:</h3>
          <ol>
            <li>✅ Redirect URI is EXACTLY: <code>https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app</code></li>
            <li>✅ OAuth consent screen is "In production" OR your email is in test users</li>
            <li>✅ Client Secret in Appwrite matches Google's Client Secret</li>
            <li>✅ Google OAuth2 is ENABLED in Appwrite</li>
          </ol>
        </div>

        <div class="success">
          <h3>After Fixing:</h3>
          <a href="https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/google?project=college-football-fantasy-app&success=http://localhost:${port}/success&failure=http://localhost:${port}/failure" class="btn">
            Test OAuth Again →
          </a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get('/success', (req, res) => {
  console.log('\n✅ SUCCESS CALLBACK');
  console.log('Query:', req.query);
  
  if (req.query.userId && req.query.secret) {
    res.send('<h1 style="color: green;">✅ OAuth WORKS!</h1><p>You can now use Google OAuth in your app!</p>');
  } else {
    res.send('<h1>⚠️ Redirected but no credentials</h1><p>Check browser console for hash fragments</p>');
  }
});

app.get('/failure', (req, res) => {
  console.log('\n❌ FAILURE CALLBACK');
  console.log('Query:', req.query);
  res.send(`<h1 style="color: red;">❌ OAuth Failed</h1><pre>${JSON.stringify(req.query, null, 2)}</pre>`);
});

app.listen(port, () => {
  console.log(`\n🚀 Server running at http://localhost:${port}`);
  console.log('Opening browser...\n');
  
  open(`http://localhost:${port}`).catch(() => {
    console.log(`Please open: http://localhost:${port}`);
  });
});
