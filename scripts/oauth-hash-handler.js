#!/usr/bin/env node

// OAuth handler that checks both query params AND hash fragments
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8791;

const app = express();

console.log('🔧 OAuth Test with Hash Fragment Handler');
console.log('=========================================\n');
console.log('Project:', projectId);
console.log('Endpoint:', endpoint);
console.log('');

app.get('/', (req, res) => {
  const successUrl = `http://localhost:${port}/callback`;
  const failureUrl = `http://localhost:${port}/callback`;
  
  // Try different OAuth approaches
  const oauthUrls = [
    {
      name: 'Client-Side OAuth (Implicit Flow)',
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=${projectId}&scopes=email,profile`,
      desc: 'Standard client-side OAuth with scopes'
    },
    {
      name: 'Server-Side OAuth (Code Flow)',
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=${projectId}&type=server`,
      desc: 'Server-side OAuth with authorization code'
    },
    {
      name: 'Direct Session Creation',
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=${projectId}`,
      desc: 'Direct session creation without token'
    }
  ];
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Test - Hash Fragment Handler</title>
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
        h1 {
          color: #333;
          margin-bottom: 10px;
        }
        .subtitle {
          color: #666;
          margin-bottom: 30px;
        }
        .url-option {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .url-option:hover {
          border-color: #667eea;
        }
        .url-name {
          font-weight: bold;
          color: #333;
          font-size: 18px;
          margin-bottom: 5px;
        }
        .url-desc {
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s;
          margin-right: 10px;
        }
        .btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .info-box {
          background: #f0f7ff;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .warning-box {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 OAuth Test - Complete Handler</h1>
        <div class="subtitle">This version handles both query parameters AND hash fragments</div>
        
        <div class="warning-box">
          <strong>⚠️ Important:</strong> Since you're getting redirected without credentials, this likely means:
          <ul>
            <li>localhost is not added as a Web platform in Appwrite</li>
            <li>OR the OAuth flow is using a different method (cookies/fragments)</li>
          </ul>
        </div>
        
        <div class="info-box">
          <strong>Try these OAuth URLs in order:</strong>
        </div>
        
        ${oauthUrls.map((item, index) => `
          <div class="url-option">
            <div class="url-name">${index + 1}. ${item.name}</div>
            <div class="url-desc">${item.desc}</div>
            <a href="${item.url}" class="btn">Test This Method →</a>
          </div>
        `).join('')}
        
        <div class="info-box">
          <strong>What we're looking for:</strong>
          <ul>
            <li>Query parameters: <code>?userId=xxx&secret=xxx</code></li>
            <li>Hash fragment: <code>#userId=xxx&secret=xxx</code></li>
            <li>Cookies: Session cookie from Appwrite</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Enhanced callback handler that checks everything
app.get('/callback', (req, res) => {
  console.log('\n=== OAuth Callback Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Full URL:', req.url);
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  console.log('Cookies:', req.headers.cookie || 'None');
  
  // Check for credentials in query params
  const { userId, secret, error, message } = req.query;
  
  if (userId && secret) {
    console.log('✅ SUCCESS! Received credentials in query params');
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
            max-width: 600px;
            text-align: center;
          }
          .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #48bb78;
            margin-bottom: 20px;
          }
          code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">✅</div>
          <h1>OAuth Success!</h1>
          <p>Credentials received in query parameters!</p>
          <p>User ID: <code>${userId}</code></p>
          <p>Secret: <code>${secret.substring(0, 20)}...</code></p>
        </div>
      </body>
      </html>
    `);
  } else {
    // No query params - check for hash fragment on client side
    console.log('⚠️ No credentials in query params, checking hash fragment...');
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
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
          }
          h1 {
            color: #333;
            margin-bottom: 20px;
          }
          .info-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
          }
          .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
          }
          .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin-top: 20px;
          }
          code {
            background: #fff;
            padding: 2px 6px;
            border: 1px solid #dee2e6;
            border-radius: 3px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔍 Checking for OAuth Credentials...</h1>
          
          <div id="status" class="info-box warning">
            Analyzing callback data...
          </div>
          
          <div class="info-box">
            <strong>Query Parameters:</strong><br>
            <span id="queryParams">${JSON.stringify(req.query) || 'None'}</span>
          </div>
          
          <div class="info-box">
            <strong>Hash Fragment:</strong><br>
            <span id="hashFragment">Checking...</span>
          </div>
          
          <div class="info-box">
            <strong>Cookies:</strong><br>
            <span id="cookies">${req.headers.cookie || 'None'}</span>
          </div>
          
          <div id="result"></div>
          
          <a href="/" class="btn">Try Again</a>
        </div>
        
        <script>
          // Check for credentials in hash fragment
          const hash = window.location.hash.substring(1);
          document.getElementById('hashFragment').textContent = hash || 'None';
          
          if (hash) {
            // Parse hash fragment
            const hashParams = new URLSearchParams(hash);
            const userId = hashParams.get('userId');
            const secret = hashParams.get('secret');
            const error = hashParams.get('error');
            
            if (userId && secret) {
              document.getElementById('status').className = 'info-box success';
              document.getElementById('status').innerHTML = '✅ SUCCESS! Credentials found in hash fragment!';
              document.getElementById('result').innerHTML = 
                '<div class="info-box success">' +
                '<strong>Credentials Retrieved:</strong><br>' +
                'User ID: <code>' + userId + '</code><br>' +
                'Secret: <code>' + secret.substring(0, 20) + '...</code><br><br>' +
                '<strong>Next Step:</strong> Use these credentials to create a session in your app!' +
                '</div>';
              
              // Send to server for logging
              fetch('/log-success', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, secretLength: secret.length, method: 'hash' })
              });
            } else if (error) {
              document.getElementById('status').className = 'info-box error';
              document.getElementById('status').innerHTML = '❌ OAuth Error: ' + error;
            } else {
              document.getElementById('status').className = 'info-box warning';
              document.getElementById('status').innerHTML = '⚠️ No credentials found in callback';
              document.getElementById('result').innerHTML = 
                '<div class="info-box warning">' +
                '<strong>Possible Issues:</strong><br>' +
                '1. localhost not added as Web platform in Appwrite<br>' +
                '2. Google OAuth not properly configured<br>' +
                '3. Wrong OAuth URL format for your Appwrite version<br><br>' +
                '<strong>Quick Fix:</strong><br>' +
                'Add localhost as a Web platform in Appwrite Console:<br>' +
                'Settings → Platforms → Add Platform → Web → Hostname: localhost' +
                '</div>';
            }
          } else {
            // No hash fragment
            document.getElementById('status').className = 'info-box warning';
            document.getElementById('status').innerHTML = '⚠️ No OAuth data received';
          }
        </script>
      </body>
      </html>
    `);
  }
});

// Success logging endpoint
app.post('/log-success', express.json(), (req, res) => {
  console.log('\n✅ OAuth Success (from client-side hash)!');
  console.log('User ID:', req.body.userId);
  console.log('Secret length:', req.body.secretLength);
  console.log('Method:', req.body.method);
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`\n🚀 OAuth Test Server Running`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\n📝 This version handles:`);
  console.log(`   • Query parameters (?userId=xxx&secret=xxx)`);
  console.log(`   • Hash fragments (#userId=xxx&secret=xxx)`);
  console.log(`   • Cookie-based sessions`);
  console.log(`\nOpening browser...`);
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
