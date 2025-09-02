#!/usr/bin/env node

// Final OAuth test with multiple approaches
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');
const { Client, Account } = require('node-appwrite');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8793;

const app = express();

console.log('🔧 Final OAuth Test - Multiple Methods');
console.log('======================================\n');
console.log('Project:', projectId);
console.log('Endpoint:', endpoint);
console.log('');

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const account = new Account(client);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Final OAuth Test</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1200px;
          margin: 40px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 30px; }
        .method {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .method h3 { color: #333; margin-top: 0; }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #4285f4;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          margin: 10px 10px 10px 0;
          cursor: pointer;
          border: none;
          font-size: 14px;
        }
        .btn:hover {
          background: #357ae8;
          transform: translateY(-2px);
        }
        .btn.sdk { background: #34a853; }
        .btn.sdk:hover { background: #2e8b47; }
        .info {
          background: #f0f7ff;
          border-left: 4px solid #4285f4;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 12px;
        }
        #result {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          display: none;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Final OAuth Test</h1>
        
        <div class="info">
          <strong>Testing with:</strong><br>
          Project: <code>${projectId}</code><br>
          Endpoint: <code>${endpoint}</code>
        </div>
        
        <div class="method">
          <h3>Method 1: Direct OAuth URLs</h3>
          <p>Test different OAuth URL formats directly:</p>
          
          <a href="${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('http://localhost:' + port + '/callback')}&failure=${encodeURIComponent('http://localhost:' + port + '/callback')}&project=${projectId}" 
             class="btn" target="_blank">
            Standard OAuth
          </a>
          
          <a href="${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent('http://localhost:' + port + '/callback')}&failure=${encodeURIComponent('http://localhost:' + port + '/callback')}" 
             class="btn" target="_blank">
            Project First
          </a>
          
          <a href="${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('http://localhost:' + port + '/callback')}&failure=${encodeURIComponent('http://localhost:' + port + '/callback')}" 
             class="btn" target="_blank">
            No Project ID
          </a>
        </div>
        
        <div class="method">
          <h3>Method 2: SDK OAuth (Recommended)</h3>
          <p>Use Appwrite SDK to generate OAuth URL:</p>
          <button onclick="testSDKOAuth()" class="btn sdk">Test SDK OAuth</button>
        </div>
        
        <div class="method">
          <h3>Method 3: Test with Production Domain</h3>
          <p>Sometimes localhost doesn't work but production does:</p>
          <a href="${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('https://cfbfantasy.app/api/auth/callback/google')}&failure=${encodeURIComponent('https://cfbfantasy.app/api/auth/callback/google')}&project=${projectId}" 
             class="btn" target="_blank">
            Test with cfbfantasy.app
          </a>
        </div>
        
        <div id="result"></div>
      </div>
      
      <script>
        async function testSDKOAuth() {
          const resultDiv = document.getElementById('result');
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = '<strong>Testing SDK OAuth...</strong>';
          
          try {
            // Call our SDK endpoint
            const response = await fetch('/sdk-oauth');
            const data = await response.json();
            
            if (data.url) {
              resultDiv.innerHTML = '<strong class="success">✅ SDK OAuth URL Generated!</strong><br>' +
                'URL: <code>' + data.url + '</code><br><br>' +
                '<a href="' + data.url + '" class="btn" target="_blank">Open OAuth URL</a>';
            } else {
              resultDiv.innerHTML = '<strong class="error">❌ Error:</strong> ' + (data.error || 'Unknown error');
            }
          } catch (error) {
            resultDiv.innerHTML = '<strong class="error">❌ Error:</strong> ' + error.message;
          }
        }
        
        // Check if we got credentials back
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        if (urlParams.get('userId') || hashParams.get('userId')) {
          const userId = urlParams.get('userId') || hashParams.get('userId');
          const secret = urlParams.get('secret') || hashParams.get('secret');
          
          const resultDiv = document.getElementById('result');
          resultDiv.style.display = 'block';
          resultDiv.innerHTML = '<strong class="success">🎉 OAuth Success!</strong><br>' +
            'User ID: <code>' + userId + '</code><br>' +
            'Secret: <code>' + (secret ? secret.substring(0, 20) + '...' : 'Not found') + '</code>';
        }
      </script>
    </body>
    </html>
  `);
});

// SDK OAuth endpoint
app.get('/sdk-oauth', async (req, res) => {
  try {
    console.log('Generating OAuth URL via SDK...');
    
    // Create OAuth2 session URL
    const successUrl = `http://localhost:${port}/callback`;
    const failureUrl = `http://localhost:${port}/callback`;
    
    // Generate OAuth URL using SDK
    const url = account.createOAuth2Session(
      'google',
      successUrl,
      failureUrl,
      [] // scopes (empty for default)
    );
    
    console.log('SDK OAuth URL:', url);
    res.json({ url });
    
  } catch (error) {
    console.error('SDK OAuth error:', error);
    res.json({ error: error.message });
  }
});

// Callback handler
app.get('/callback', (req, res) => {
  console.log('\n=== OAuth Callback ===');
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  console.log('Headers Cookie:', req.headers.cookie || 'None');
  
  const { userId, secret, error } = req.query;
  
  if (userId && secret) {
    console.log('✅ SUCCESS! OAuth is working!');
    res.send(`
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .success-box {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
          }
          .success-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #48bb78; }
          code {
            background: #f4f4f4;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">🎉</div>
          <h1>OAuth Works!</h1>
          <p>Successfully authenticated with Google!</p>
          <p>User ID: <code>${userId}</code></p>
          <p>Secret: <code>${secret.substring(0, 30)}...</code></p>
          <br>
          <a href="/" style="color: #4285f4;">← Back to Test Page</a>
        </div>
      </body>
      </html>
    `);
  } else {
    console.log('⚠️ No credentials received');
    res.send(`
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            background: #f8f9fa;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 { color: #f39c12; }
          .info {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            padding: 20px;
            border-radius: 4px;
            margin: 20px 0;
          }
          pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ No OAuth Credentials Received</h1>
          
          <div class="info">
            <strong>Debugging Information:</strong>
          </div>
          
          <h3>Query Parameters:</h3>
          <pre>${JSON.stringify(req.query, null, 2) || 'None'}</pre>
          
          <h3>URL Hash (check console):</h3>
          <pre id="hash">Checking...</pre>
          
          <h3>Cookies:</h3>
          <pre>${req.headers.cookie || 'None'}</pre>
          
          <script>
            // Check hash fragment
            const hash = window.location.hash.substring(1);
            document.getElementById('hash').textContent = hash || 'None';
            
            if (hash) {
              const params = new URLSearchParams(hash);
              const userId = params.get('userId');
              const secret = params.get('secret');
              
              if (userId && secret) {
                document.body.innerHTML = '<div style="text-align: center; padding: 40px;">' +
                  '<h1 style="color: #28a745;">✅ Found in Hash!</h1>' +
                  '<p>User ID: ' + userId + '</p>' +
                  '<p>OAuth is working but using hash fragments!</p>' +
                  '</div>';
              }
            }
          </script>
          
          <br>
          <a href="/">← Back to Test Page</a>
        </div>
      </body>
      </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Final OAuth Test Server`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\nThis test includes:`);
  console.log(`• Multiple OAuth URL formats`);
  console.log(`• SDK-based OAuth generation`);
  console.log(`• Production domain test`);
  console.log(`• Hash fragment detection`);
  console.log(`\nOpening browser...`);
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
