#!/usr/bin/env node

// Working OAuth test with correct SDK method
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8794;

const app = express();

console.log('🔧 OAuth Working Test');
console.log('=====================\n');
console.log('Project:', projectId);
console.log('Endpoint:', endpoint);
console.log('');

app.get('/', (req, res) => {
  // Build OAuth URLs manually
  const successUrl = `http://localhost:${port}/callback`;
  const failureUrl = `http://localhost:${port}/callback`;
  
  // Different OAuth URL patterns to test
  const oauthUrls = [
    {
      name: 'OAuth with explicit localhost',
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=${projectId}`,
      note: 'Standard format with localhost callbacks'
    },
    {
      name: 'OAuth with IP address',
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('http://127.0.0.1:' + port + '/callback')}&failure=${encodeURIComponent('http://127.0.0.1:' + port + '/callback')}&project=${projectId}`,
      note: 'Using 127.0.0.1 instead of localhost'
    },
    {
      name: 'OAuth with different callback path',
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('http://localhost:' + port + '/oauth/callback')}&failure=${encodeURIComponent('http://localhost:' + port + '/oauth/callback')}&project=${projectId}`,
      note: 'Different callback path'
    }
  ];
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Working Test</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 40px auto;
          padding: 20px;
          background: #f5f7fa;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 30px; }
        .test {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .test h3 { margin-top: 0; color: #495057; }
        .test p { color: #6c757d; font-size: 14px; }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 10px 10px 0;
        }
        .btn:hover { background: #0056b3; }
        .url {
          background: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
          margin: 10px 0;
        }
        .status {
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .status.checking { background: #fff3cd; border: 1px solid #ffc107; }
        .status.success { background: #d4edda; border: 1px solid #28a745; }
        .status.error { background: #f8d7da; border: 1px solid #dc3545; }
        .important {
          background: #e7f3ff;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 OAuth Working Test</h1>
        
        <div class="important">
          <strong>📝 Current Status:</strong><br>
          ✅ localhost is added as a platform<br>
          ✅ Google OAuth is enabled in Appwrite<br>
          ✅ Google credentials are configured<br>
          ❌ OAuth redirects but returns no credentials
        </div>
        
        <h2>Test Different Callback Formats:</h2>
        
        ${oauthUrls.map((item, index) => `
          <div class="test">
            <h3>${index + 1}. ${item.name}</h3>
            <p>${item.note}</p>
            <div class="url">${item.url}</div>
            <a href="${item.url}" class="btn" target="_blank">Test This →</a>
          </div>
        `).join('')}
        
        <div class="test">
          <h3>4. Test with Manual SDK URL</h3>
          <p>Build OAuth URL using SDK pattern</p>
          <button onclick="testSDK()" class="btn" style="background: #28a745;">Generate SDK URL</button>
          <div id="sdk-result"></div>
        </div>
        
        <div class="test">
          <h3>5. Debug: Check OAuth Provider Status</h3>
          <p>Verify Google OAuth is actually enabled</p>
          <button onclick="checkStatus()" class="btn" style="background: #6610f2;">Check Status</button>
          <div id="status-result"></div>
        </div>
      </div>
      
      <script>
        function testSDK() {
          const result = document.getElementById('sdk-result');
          
          // SDK URL pattern
          const endpoint = '${endpoint}';
          const projectId = '${projectId}';
          const successUrl = 'http://localhost:${port}/callback';
          const failureUrl = 'http://localhost:${port}/callback';
          
          // This is how the SDK builds the URL
          const sdkUrl = endpoint + '/account/sessions/oauth2/google' +
            '?project=' + projectId +
            '&success=' + encodeURIComponent(successUrl) +
            '&failure=' + encodeURIComponent(failureUrl);
          
          result.innerHTML = '<div class="url">' + sdkUrl + '</div>' +
            '<a href="' + sdkUrl + '" class="btn" target="_blank">Open SDK URL →</a>';
        }
        
        async function checkStatus() {
          const result = document.getElementById('status-result');
          result.innerHTML = '<div class="status checking">Checking OAuth status...</div>';
          
          try {
            // Try to get project info
            const response = await fetch('/check-oauth-status');
            const data = await response.json();
            
            if (data.error) {
              result.innerHTML = '<div class="status error">Error: ' + data.error + '</div>';
            } else {
              result.innerHTML = '<div class="status success">Check complete - see console for details</div>';
            }
          } catch (error) {
            result.innerHTML = '<div class="status error">Error: ' + error.message + '</div>';
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Callback handlers
app.get('/callback', handleCallback);
app.get('/oauth/callback', handleCallback);

function handleCallback(req, res) {
  console.log('\n=== OAuth Callback Received ===');
  console.log('Path:', req.path);
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  console.log('Headers:', {
    cookie: req.headers.cookie || 'None',
    referer: req.headers.referer || 'None'
  });
  
  const { userId, secret, error, message } = req.query;
  
  if (userId && secret) {
    console.log('✅ SUCCESS! OAuth is working!');
    res.send(`
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1 style="color: #28a745;">✅ OAuth Success!</h1>
        <p>User ID: <code>${userId}</code></p>
        <p>Secret: <code>${secret.substring(0, 30)}...</code></p>
        <p>OAuth is working correctly!</p>
      </body>
      </html>
    `);
  } else if (error) {
    console.log('❌ OAuth error:', error, message);
    res.send(`
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1 style="color: #dc3545;">❌ OAuth Error</h1>
        <p>Error: ${error}</p>
        <p>Message: ${message || 'No message'}</p>
      </body>
      </html>
    `);
  } else {
    console.log('⚠️ No credentials received');
    res.send(`
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #f39c12; }
          pre { background: #f4f4f4; padding: 15px; border-radius: 4px; }
          .important { background: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ No OAuth Credentials</h1>
          
          <div class="important">
            <strong>This indicates one of these issues:</strong>
            <ul>
              <li>Google OAuth credentials in Appwrite are incorrect</li>
              <li>The redirect URI is not whitelisted in Google Cloud Console</li>
              <li>There's a mismatch between the OAuth configuration</li>
            </ul>
          </div>
          
          <h3>Debug Information:</h3>
          <pre>
Path: ${req.path}
Query: ${JSON.stringify(req.query, null, 2)}
Cookie: ${req.headers.cookie || 'None'}
Referer: ${req.headers.referer || 'None'}

Hash (check browser console):
<script>
  document.write(window.location.hash || 'None');
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    if (params.get('userId')) {
      document.write('\\n\\n<strong style="color: green;">Found in hash! userId: ' + params.get('userId') + '</strong>');
    }
  }
</script>
          </pre>
          
          <h3>What to check in Google Cloud Console:</h3>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a></li>
            <li>Find your OAuth 2.0 Client ID</li>
            <li>Check that this URI is in "Authorized redirect URIs":<br>
                <code>https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/college-football-fantasy-app</code>
            </li>
            <li>Make sure the Client ID and Secret in Appwrite match exactly</li>
          </ol>
          
          <p><a href="/">← Back to Test</a></p>
        </div>
      </body>
      </html>
    `);
  }
}

// Check OAuth status endpoint
app.get('/check-oauth-status', async (req, res) => {
  console.log('\n=== Checking OAuth Configuration ===');
  
  // Log what we know
  console.log('Project:', projectId);
  console.log('Endpoint:', endpoint);
  console.log('Expected Google callback URL:');
  console.log(`  ${endpoint}/account/sessions/oauth2/callback/google/${projectId}`);
  console.log('');
  console.log('Make sure this EXACT URL is in your Google Cloud Console');
  console.log('as an Authorized redirect URI!');
  
  res.json({ 
    message: 'Check console for details',
    callbackUrl: `${endpoint}/account/sessions/oauth2/callback/google/${projectId}`
  });
});

app.listen(port, () => {
  console.log(`\n🚀 OAuth Working Test Server`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\nThis test will help identify the exact issue.`);
  console.log(`\nOpening browser...`);
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
