#!/usr/bin/env node

// Test Google OAuth with existing project configuration
const express = require('express');
const open = require('open');

// Use your project's environment variables
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8788; // Different port to avoid conflicts

if (!endpoint || !projectId) {
  console.error('Missing NEXT_PUBLIC_APPWRITE_ENDPOINT or NEXT_PUBLIC_APPWRITE_PROJECT_ID in .env.local');
  process.exit(1);
}

console.log('Using configuration:');
console.log('Endpoint:', endpoint);
console.log('Project:', projectId);
console.log('');

const app = express();

// Build OAuth URL for Google
function buildGoogleOAuthUrl(success, failure) {
  const base = endpoint.replace(/\/$/, '');
  const params = new URLSearchParams({
    project: projectId,
    success,
    failure
  });
  // Using the token flow endpoint
  return `${base}/account/sessions/oauth2/google/token?${params.toString()}`;
}

// Home page - start OAuth flow
app.get('/', async (req, res) => {
  const success = `http://localhost:${port}/oauth/success`;
  const failure = `http://localhost:${port}/oauth/failure`;
  const loginUrl = buildGoogleOAuthUrl(success, failure);

  console.log('OAuth URL generated:', loginUrl);
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Google OAuth Test - CFB Fantasy</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        .btn {
          display: inline-block;
          padding: 12px 24px;
          background: #4285f4;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          margin-top: 20px;
        }
        .btn:hover { background: #357ae8; }
        .info { 
          background: #f0f0f0; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0;
          font-family: monospace;
          font-size: 14px;
        }
        .step { margin: 10px 0; padding-left: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏈 CFB Fantasy - Google OAuth Test</h1>
        
        <div class="info">
          <strong>Project:</strong> ${projectId}<br>
          <strong>Endpoint:</strong> ${endpoint}
        </div>
        
        <h2>Steps:</h2>
        <ol>
          <li class="step">Click the button below to start Google OAuth</li>
          <li class="step">Log in with your Google account</li>
          <li class="step">You'll be redirected back here with your session</li>
        </ol>
        
        <a href="${loginUrl}" class="btn">🔐 Sign in with Google</a>
        
        <div class="info" style="margin-top: 30px;">
          <strong>Debug - Full OAuth URL:</strong><br>
          <span style="word-break: break-all; font-size: 12px;">${loginUrl}</span>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Success callback
app.get('/oauth/success', async (req, res) => {
  const { userId, secret } = req.query;
  
  console.log('\n=== OAuth Success Callback ===');
  console.log('User ID:', userId);
  console.log('Secret:', secret ? 'Received (hidden)' : 'Not received');
  
  if (!userId || !secret) {
    return res.status(400).send(`
      <h2>❌ Missing credentials</h2>
      <p>userId or secret not received from Appwrite.</p>
      <pre>${JSON.stringify(req.query, null, 2)}</pre>
    `);
  }

  // Now you would exchange these for a session
  // Since we're testing without the SDK, we'll just display success
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Success</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .success {
          color: #22c55e;
          font-size: 48px;
          margin-bottom: 20px;
        }
        .info {
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .next-steps {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">✅</div>
        <h1>Google OAuth Successful!</h1>
        
        <div class="info">
          <h3>Received from Appwrite:</h3>
          <p><strong>User ID:</strong> <code>${userId}</code></p>
          <p><strong>Secret:</strong> <code>[HIDDEN - ${secret.length} chars]</code></p>
        </div>
        
        <div class="next-steps">
          <h3>✨ What this means:</h3>
          <ul>
            <li>Google OAuth is properly configured in Appwrite ✅</li>
            <li>The callback URLs are working correctly ✅</li>
            <li>Your project can receive OAuth tokens ✅</li>
          </ul>
          
          <h3>📝 Next steps in your app:</h3>
          <ol>
            <li>Use <code>account.createSession({ userId, secret })</code> to create a session</li>
            <li>Store the session for the user</li>
            <li>Redirect to your app's dashboard</li>
          </ol>
        </div>
        
        <p style="margin-top: 30px;">
          <a href="/" style="color: #6366f1;">← Test again</a>
        </p>
      </div>
    </body>
    </html>
  `);
});

// Failure callback
app.get('/oauth/failure', (req, res) => {
  console.error('OAuth failed:', req.query);
  res.status(400).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Failed</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
        }
        .error {
          color: #ef4444;
          font-size: 48px;
          margin-bottom: 20px;
        }
        pre {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 5px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="error">❌</div>
      <h1>OAuth Failed</h1>
      <p>Error details:</p>
      <pre>${JSON.stringify(req.query, null, 2)}</pre>
      <p><a href="/">← Try again</a></p>
    </body>
    </html>
  `);
});

// Start server
app.listen(port, () => {
  console.log(`\n🚀 OAuth Test Server Running`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\nOpening browser...`);
  
  // Auto-open browser
  setTimeout(() => {
    open(`http://localhost:${port}`);
  }, 1000);
});
