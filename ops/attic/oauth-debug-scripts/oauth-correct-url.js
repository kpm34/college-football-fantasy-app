#!/usr/bin/env node

// OAuth with correct Appwrite v1.8.0 URL format
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8790;

const app = express();

console.log('🔧 OAuth Test with Correct URLs (Appwrite 1.8.0)');
console.log('=================================================\n');
console.log('Project:', projectId);
console.log('Endpoint:', endpoint);
console.log('');

app.get('/', (req, res) => {
  const successUrl = `http://localhost:${port}/callback`;
  const failureUrl = `http://localhost:${port}/callback`;
  
  // Correct OAuth URLs for Appwrite 1.8.0
  // Format: /v1/account/sessions/oauth2/{provider}
  const oauthUrls = [
    {
      name: 'Standard OAuth Flow (v1.8.0)',
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}&project=${projectId}`,
      desc: 'Standard OAuth2 flow with session cookies'
    },
    {
      name: 'Alternative Format 1',
      url: `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`,
      desc: 'Project ID first in query params'
    },
    {
      name: 'Alternative Format 2', 
      url: `${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`,
      desc: 'Without project ID (uses header)'
    }
  ];
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Test - Correct URLs</title>
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
        .url-text {
          background: #fff;
          border: 1px solid #dee2e6;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          word-break: break-all;
          margin-bottom: 15px;
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
        }
        .btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        .btn.secondary {
          background: #48bb78;
        }
        .btn.secondary:hover {
          background: #38a169;
        }
        .info-box {
          background: #f0f7ff;
          border-left: 4px solid #667eea;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .info-box h3 {
          margin-top: 0;
          color: #333;
        }
        .info-box ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .config {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .config code {
          background: #fff;
          padding: 2px 6px;
          border-radius: 3px;
          border: 1px solid #dee2e6;
        }
        .test-link {
          display: inline-block;
          margin-right: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 OAuth Test - Appwrite v1.8.0</h1>
        <div class="subtitle">Testing different OAuth URL formats to find the working one</div>
        
        <div class="config">
          <strong>Current Configuration:</strong><br>
          Project: <code>${projectId}</code><br>
          Endpoint: <code>${endpoint}</code><br>
          Callback: <code>http://localhost:${port}/callback</code>
        </div>
        
        <div class="info-box">
          <h3>⚡ Quick Test Instructions</h3>
          <ol>
            <li>Click each "Test This Format" button below</li>
            <li>If you reach Google's login page → That format works!</li>
            <li>If you get an error → Try the next format</li>
            <li>Once you find a working format, complete the Google login</li>
          </ol>
        </div>
        
        ${oauthUrls.map((item, index) => `
          <div class="url-option">
            <div class="url-name">${item.name}</div>
            <div class="url-desc">${item.desc}</div>
            <div class="url-text">${item.url}</div>
            <a href="${item.url}" class="btn test-link" target="_blank">Test This Format →</a>
            <button onclick="copyToClipboard('${item.url}')" class="btn secondary">Copy URL</button>
          </div>
        `).join('')}
        
        <div class="info-box" style="background: #fef5e7; border-color: #f39c12;">
          <h3>🔍 Debugging Tips</h3>
          <ul>
            <li><strong>404 Error:</strong> URL format is wrong for your Appwrite version</li>
            <li><strong>Platform Error:</strong> Need to add localhost in Appwrite Console</li>
            <li><strong>Redirect Error:</strong> OAuth provider not configured properly</li>
            <li><strong>Success:</strong> You reach Google login = Everything is configured!</li>
          </ul>
        </div>
        
        <div class="info-box" style="background: #e8f5e9; border-color: #4caf50;">
          <h3>✅ If OAuth Works</h3>
          <p>Once you find the working format and complete Google login, you'll be redirected back here with:</p>
          <ul>
            <li>userId - Your Appwrite user ID</li>
            <li>secret - Session secret for authentication</li>
          </ul>
          <p>These can be used to create a session in your app!</p>
        </div>
      </div>
      
      <script>
        function copyToClipboard(text) {
          navigator.clipboard.writeText(text).then(() => {
            alert('URL copied to clipboard!');
          });
        }
      </script>
    </body>
    </html>
  `);
});

// Callback handler
app.get('/callback', (req, res) => {
  console.log('\n=== OAuth Callback Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  const { userId, secret, error, message } = req.query;
  
  if (userId && secret) {
    console.log('✅ SUCCESS! Received userId and secret');
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
          .data strong {
            color: #333;
          }
          .data code {
            background: #fff;
            padding: 2px 6px;
            border: 1px solid #dee2e6;
            border-radius: 3px;
            font-family: monospace;
            word-break: break-all;
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
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="success-icon">✅</div>
          <h1>OAuth Success!</h1>
          <p>Google OAuth is working correctly with your Appwrite setup!</p>
          
          <div class="data">
            <strong>User ID:</strong><br>
            <code>${userId}</code><br><br>
            <strong>Secret:</strong><br>
            <code>${secret.substring(0, 20)}...</code> (${secret.length} chars)
          </div>
          
          <p>You can now use these credentials to create a session in your app:</p>
          <div class="data">
            <code>
              const session = await account.createSession({<br>
              &nbsp;&nbsp;userId: '${userId}',<br>
              &nbsp;&nbsp;secret: 'THE_SECRET_ABOVE'<br>
              });
            </code>
          </div>
          
          <a href="/" class="btn">Test Another Format</a>
        </div>
      </body>
      </html>
    `);
  } else if (error) {
    console.log('❌ OAuth failed:', error, message);
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
        </style>
      </head>
      <body>
        <div class="error-box">
          <div class="error-icon">❌</div>
          <h1>OAuth Error</h1>
          
          <div class="error-details">
            <strong>Error:</strong> ${error}<br>
            <strong>Message:</strong> ${message || 'No message provided'}
          </div>
          
          <p>This usually means one of:</p>
          <ul style="text-align: left;">
            <li>localhost not added as a platform</li>
            <li>Google OAuth not configured in Appwrite</li>
            <li>Invalid OAuth URL format</li>
          </ul>
          
          <a href="/" class="btn">Try Another Format</a>
        </div>
      </body>
      </html>
    `);
  } else {
    console.log('⚠️ No credentials received');
    res.send(`
      <html>
      <body style="font-family: sans-serif; padding: 40px;">
        <h2>⚠️ No OAuth credentials received</h2>
        <p>Query params: ${JSON.stringify(req.query)}</p>
        <p><a href="/">Try again</a></p>
      </body>
      </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`\n🚀 OAuth Test Server Running`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\nOpening browser...`);
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
