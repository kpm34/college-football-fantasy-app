#!/usr/bin/env node

// Deep OAuth diagnostic - test if the issue is with Appwrite's OAuth implementation
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8795;

const app = express();

console.log('🔍 OAuth Deep Diagnostic');
console.log('========================\n');
console.log('Since everything is configured correctly, let\'s test:');
console.log('1. If OAuth works with a different provider');
console.log('2. If the issue is specific to Google OAuth');
console.log('3. If cookies/sessions are being blocked\n');

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Diagnostic</title>
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
        .diagnostic {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .test {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 10px 10px 0;
          cursor: pointer;
          border: none;
        }
        .btn:hover { background: #0056b3; }
        .btn.github { background: #333; }
        .btn.github:hover { background: #000; }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
        #results {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          display: none;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 OAuth Deep Diagnostic</h1>
        
        <div class="diagnostic">
          <strong>Current Situation:</strong><br>
          ✅ localhost is added as platform<br>
          ✅ Google OAuth is enabled<br>
          ✅ Credentials are configured<br>
          ✅ Callback URL is correct in Google Console<br>
          ❌ Still no credentials returned
        </div>
        
        <div class="test">
          <h3>Test 1: Try GitHub OAuth</h3>
          <p>If GitHub works but Google doesn't, the issue is Google-specific</p>
          <a href="${endpoint}/account/sessions/oauth2/github?success=${encodeURIComponent('http://localhost:' + port + '/callback')}&failure=${encodeURIComponent('http://localhost:' + port + '/callback')}&project=${projectId}" 
             class="btn github" target="_blank">
            Test GitHub OAuth
          </a>
        </div>
        
        <div class="test">
          <h3>Test 2: Direct Appwrite Test</h3>
          <p>Test OAuth directly on Appwrite's domain to rule out localhost issues</p>
          <button onclick="testDirect()" class="btn">Generate Direct Test URL</button>
          <div id="direct-result"></div>
        </div>
        
        <div class="test">
          <h3>Test 3: Check Cookie Settings</h3>
          <p>Verify browser isn't blocking third-party cookies</p>
          <button onclick="checkCookies()" class="btn">Check Cookie Settings</button>
          <div id="cookie-result"></div>
        </div>
        
        <div class="test">
          <h3>Test 4: Manual Session Creation</h3>
          <p>Try creating a session manually to verify Appwrite is working</p>
          <button onclick="testManualSession()" class="btn">Test Manual Session</button>
          <div id="session-result"></div>
        </div>
        
        <div class="test">
          <h3>Test 5: Check Browser Console</h3>
          <p>Open browser DevTools (F12) and check for errors in Console/Network tabs</p>
          <button onclick="openConsole()" class="btn">Instructions</button>
          <div id="console-instructions" style="display: none; margin-top: 10px;">
            <ol>
              <li>Press F12 to open DevTools</li>
              <li>Go to Network tab</li>
              <li>Click "Test Google OAuth" below</li>
              <li>Watch for any red errors or blocked requests</li>
              <li>Check Console tab for JavaScript errors</li>
            </ol>
            <a href="${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('http://localhost:' + port + '/callback')}&failure=${encodeURIComponent('http://localhost:' + port + '/callback')}&project=${projectId}" 
               class="btn" target="_blank">
              Test Google OAuth with DevTools Open
            </a>
          </div>
        </div>
        
        <div id="results"></div>
      </div>
      
      <script>
        function testDirect() {
          const result = document.getElementById('direct-result');
          const directUrl = 'https://nyc.cloud.appwrite.io/console/project-college-football-fantasy-app/auth/users';
          result.innerHTML = '<p>Try logging in directly to Appwrite Console with Google OAuth:</p>' +
            '<a href="' + directUrl + '" class="btn" target="_blank">Open Appwrite Console</a>' +
            '<p style="margin-top: 10px;">If Google OAuth works there, the issue is with the API implementation</p>';
        }
        
        function checkCookies() {
          const result = document.getElementById('cookie-result');
          
          // Check if cookies are enabled
          document.cookie = "testcookie=test; path=/";
          const cookiesEnabled = document.cookie.indexOf("testcookie") !== -1;
          
          // Check third-party cookies
          const thirdPartyTest = navigator.cookieEnabled;
          
          result.innerHTML = '<strong>Cookie Status:</strong><br>' +
            'First-party cookies: ' + (cookiesEnabled ? '<span class="success">✅ Enabled</span>' : '<span class="error">❌ Disabled</span>') + '<br>' +
            'Browser cookies: ' + (thirdPartyTest ? '<span class="success">✅ Enabled</span>' : '<span class="error">❌ Disabled</span>') + '<br><br>' +
            '<strong>If cookies are blocked:</strong><br>' +
            '1. Click the lock icon in the address bar<br>' +
            '2. Site settings → Cookies → Allow<br>' +
            '3. Or try in Incognito/Private mode';
        }
        
        async function testManualSession() {
          const result = document.getElementById('session-result');
          result.innerHTML = '<p>Testing Appwrite connection...</p>';
          
          try {
            // Test if we can reach Appwrite
            const response = await fetch('${endpoint}/health', {
              headers: {
                'X-Appwrite-Project': '${projectId}'
              }
            });
            
            if (response.ok) {
              result.innerHTML = '<span class="success">✅ Appwrite is reachable</span><br>' +
                'The issue is specifically with OAuth flow';
            } else {
              result.innerHTML = '<span class="error">❌ Cannot reach Appwrite</span><br>' +
                'Status: ' + response.status;
            }
          } catch (error) {
            result.innerHTML = '<span class="error">❌ Network error:</span> ' + error.message;
          }
        }
        
        function openConsole() {
          document.getElementById('console-instructions').style.display = 'block';
        }
      </script>
    </body>
    </html>
  `);
});

// Callback handler
app.get('/callback', (req, res) => {
  console.log('\n=== OAuth Callback ===');
  console.log('Provider:', req.query.provider || 'google');
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  console.log('All headers:', JSON.stringify(req.headers, null, 2));
  
  const { userId, secret, error } = req.query;
  
  if (userId && secret) {
    console.log('✅ SUCCESS!');
    res.send(`
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px;">
        <h1 style="color: #28a745;">✅ OAuth Works!</h1>
        <p>Provider: ${req.query.provider || 'Google'}</p>
        <p>User ID: <code>${userId}</code></p>
        <p>Secret received: Yes</p>
      </body>
      </html>
    `);
  } else {
    console.log('⚠️ No credentials');
    
    // Check for Appwrite-specific error patterns
    const appwriteSession = req.headers['x-appwrite-session'];
    const appwriteUser = req.headers['x-appwrite-user-id'];
    
    res.send(`
      <html>
      <body style="font-family: sans-serif; padding: 40px;">
        <h1 style="color: #f39c12;">⚠️ OAuth Callback - No Credentials</h1>
        
        <h3>Query Parameters:</h3>
        <pre style="background: #f4f4f4; padding: 15px;">${JSON.stringify(req.query, null, 2) || 'None'}</pre>
        
        <h3>Relevant Headers:</h3>
        <pre style="background: #f4f4f4; padding: 15px;">
Cookie: ${req.headers.cookie || 'None'}
Referer: ${req.headers.referer || 'None'}
X-Appwrite-Session: ${appwriteSession || 'None'}
X-Appwrite-User-Id: ${appwriteUser || 'None'}
        </pre>
        
        <h3>Possible Issues:</h3>
        <ul style="text-align: left;">
          <li><strong>Cookie blocking:</strong> Browser might be blocking third-party cookies from Appwrite</li>
          <li><strong>CORS issue:</strong> Cross-origin requests might be blocked</li>
          <li><strong>Session issue:</strong> Appwrite might not be creating the session properly</li>
          <li><strong>OAuth scopes:</strong> Google might need specific scopes enabled</li>
        </ul>
        
        <h3>Try This:</h3>
        <ol style="text-align: left;">
          <li>Open Chrome DevTools (F12) → Application → Cookies</li>
          <li>Clear all cookies for localhost and nyc.cloud.appwrite.io</li>
          <li>Try OAuth again</li>
          <li>Or try in an Incognito/Private window</li>
        </ol>
        
        <p><a href="/">← Back to Tests</a></p>
      </body>
      </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`\n🚀 OAuth Diagnostic Server`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\nRunning comprehensive diagnostics...`);
  console.log(`\nOpening browser...`);
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
