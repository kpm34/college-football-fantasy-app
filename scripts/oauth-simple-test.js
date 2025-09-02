#!/usr/bin/env node

// Simple OAuth test without scopes parameter
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8792;

const app = express();

console.log('🔧 Simple OAuth Test');
console.log('====================\n');
console.log('Project:', projectId);
console.log('Endpoint:', endpoint);
console.log('');

app.get('/', (req, res) => {
  const successUrl = `http://localhost:${port}/callback`;
  const failureUrl = `http://localhost:${port}/callback`;
  
  // Simple OAuth URL without scopes
  const oauthUrl = `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=${projectId}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple OAuth Test</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
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
          margin-bottom: 30px;
        }
        .btn {
          display: inline-block;
          padding: 16px 32px;
          background: #4285f4;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 18px;
          transition: all 0.3s;
        }
        .btn:hover {
          background: #357ae8;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4);
        }
        .info-box {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .config {
          background: #f0f7ff;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        code {
          background: #fff;
          padding: 2px 6px;
          border: 1px solid #dee2e6;
          border-radius: 3px;
          font-family: monospace;
        }
        .steps {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .steps ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        .steps li {
          margin: 8px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 Simple OAuth Test</h1>
        
        <div class="config">
          <strong>Configuration:</strong><br>
          Project: <code>${projectId}</code><br>
          Endpoint: <code>${endpoint}</code><br>
          Callback: <code>http://localhost:${port}/callback</code>
        </div>
        
        <div class="steps">
          <strong>What will happen:</strong>
          <ol>
            <li>Click the button below</li>
            <li>If you see Google login → localhost is configured! ✅</li>
            <li>If you get an error → localhost needs to be added ❌</li>
            <li>Complete Google login</li>
            <li>Get redirected back with credentials</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${oauthUrl}" class="btn">🚀 Test Google OAuth</a>
        </div>
        
        <div class="info-box">
          <strong>OAuth URL:</strong><br>
          <code style="word-break: break-all; font-size: 12px;">${oauthUrl}</code>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Callback handler
app.get('/callback', (req, res) => {
  console.log('\n=== OAuth Callback ===');
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  
  const { userId, secret, error } = req.query;
  
  if (userId && secret) {
    console.log('✅ SUCCESS! OAuth is working!');
    console.log('User ID:', userId);
    console.log('Secret length:', secret.length);
    
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
          .data {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
          code {
            background: #fff;
            padding: 2px 6px;
            border: 1px solid #dee2e6;
            border-radius: 3px;
            font-family: monospace;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">🎉</div>
          <h1>OAuth Works!</h1>
          <p>Google OAuth is configured correctly!</p>
          
          <div class="data">
            <strong>User ID:</strong><br>
            <code>${userId}</code><br><br>
            <strong>Secret:</strong><br>
            <code>${secret.substring(0, 30)}...</code> (${secret.length} chars)
          </div>
          
          <p>✅ localhost is properly configured<br>
          ✅ Google OAuth is enabled<br>
          ✅ Everything is working!</p>
        </div>
      </body>
      </html>
    `);
  } else if (error) {
    console.log('❌ OAuth error:', error);
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
          .error-box {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 600px;
            text-align: center;
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #f56565;
            margin-bottom: 20px;
          }
          .error-details {
            background: #fff5f5;
            border: 1px solid #feb2b2;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="error-box">
          <div class="error-icon">❌</div>
          <h1>OAuth Error</h1>
          
          <div class="error-details">
            <strong>Error:</strong> ${error}<br>
            ${req.query.message ? `<strong>Message:</strong> ${req.query.message}` : ''}
          </div>
          
          <p>This usually means localhost needs to be added as a platform.</p>
        </div>
      </body>
      </html>
    `);
  } else {
    // Check for hash fragment on client side
    console.log('⚠️ No credentials in query, checking hash...');
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
            max-width: 600px;
            text-align: center;
          }
          .warning-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #f39c12;
            margin-bottom: 20px;
          }
          .info {
            background: #fff3cd;
            border: 1px solid #ffeeba;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="warning-icon">⚠️</div>
          <h1>No OAuth Credentials</h1>
          
          <div class="info">
            <strong>This means:</strong><br>
            • localhost is not added as a platform<br>
            • OR OAuth was cancelled
          </div>
          
          <p id="hash-check">Checking for hash fragment...</p>
          
          <script>
            // Check if credentials are in hash
            const hash = window.location.hash.substring(1);
            if (hash) {
              const params = new URLSearchParams(hash);
              const userId = params.get('userId');
              const secret = params.get('secret');
              
              if (userId && secret) {
                document.getElementById('hash-check').innerHTML = 
                  '<strong style="color: green;">✅ Found credentials in hash!</strong><br>' +
                  'User ID: ' + userId + '<br>' +
                  'OAuth is working!';
              } else {
                document.getElementById('hash-check').innerHTML = 
                  'No credentials in hash either.';
              }
            } else {
              document.getElementById('hash-check').innerHTML = 
                'No hash fragment found.<br><br>' +
                '<strong>Solution:</strong> Add localhost as a Web platform in Appwrite Console.';
            }
          </script>
        </div>
      </body>
      </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Simple OAuth Test Server`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\nOpening browser...`);
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
