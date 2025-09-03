#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');
const app = express();
const port = 8798;

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

console.log('🚀 Final OAuth Test');
console.log('===================');
console.log('Project:', projectId);
console.log('Endpoint:', endpoint);
console.log('');

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.query).length > 0) {
    console.log('Query params:', req.query);
  }
  next();
});

app.get('/', (req, res) => {
  const oauthUrl = `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(`http://localhost:${port}/callback`)}&failure=${encodeURIComponent(`http://localhost:${port}/callback`)}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Final Test</title>
      <style>
        body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; }
        .btn { display: inline-block; padding: 12px 24px; background: #4285f4; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; font-size: 16px; }
        .btn:hover { background: #357ae8; }
        .info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 12px; word-break: break-all; }
        .debug { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔐 OAuth Final Test</h1>
        
        <div class="info">
          <h3>Configuration:</h3>
          <p><strong>Project ID:</strong> <code>${projectId}</code></p>
          <p><strong>Endpoint:</strong> <code>${endpoint}</code></p>
        </div>
        
        <div class="debug">
          <h3>⚠️ Before Testing:</h3>
          <ol>
            <li>Clear your browser cookies for nyc.cloud.appwrite.io</li>
            <li>Try in an incognito/private window</li>
            <li>Make sure you're not already logged into Appwrite</li>
          </ol>
        </div>
        
        <a href="${oauthUrl}" class="btn">
          Sign in with Google →
        </a>
        
        <div class="info">
          <h3>OAuth URL:</h3>
          <code>${oauthUrl}</code>
        </div>
        
        <div class="debug">
          <h3>What to expect:</h3>
          <ol>
            <li>Click the button above</li>
            <li>You'll be redirected to Google sign-in</li>
            <li>After signing in, you'll be redirected back here</li>
            <li>The callback URL will contain either:
              <ul>
                <li>✅ <code>userId</code> and <code>secret</code> (success)</li>
                <li>❌ <code>error</code> and <code>message</code> (failure)</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>
      
      <script>
        // Log any hash fragments
        if (window.location.hash) {
          console.log('Hash fragment detected:', window.location.hash);
          document.body.innerHTML += '<div style="background: yellow; padding: 20px; margin: 20px;">Hash: ' + window.location.hash + '</div>';
        }
      </script>
    </body>
    </html>
  `);
});

app.get('/callback', (req, res) => {
  console.log('\n=== OAuth Callback Received ===');
  console.log('Time:', new Date().toISOString());
  console.log('Query params:', req.query);
  console.log('Headers:', {
    cookie: req.headers.cookie,
    referer: req.headers.referer
  });
  
  if (req.query.userId && req.query.secret) {
    console.log('✅ SUCCESS! OAuth is working!');
    console.log('User ID:', req.query.userId);
    console.log('Secret:', req.query.secret.substring(0, 20) + '...');
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Success!</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; color: #155724; }
          h1 { color: #155724; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="success">
          <h1>✅ OAuth Working!</h1>
          <p><strong>User ID:</strong> <code>${req.query.userId}</code></p>
          <p><strong>Secret:</strong> <code>${req.query.secret.substring(0, 20)}...</code></p>
          <p>OAuth is now properly configured and working!</p>
        </div>
      </body>
      </html>
    `);
  } else if (req.query.error) {
    console.log('❌ OAuth Error:', req.query.error);
    console.log('Message:', req.query.message);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Error</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          .error { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 8px; color: #721c24; }
          h1 { color: #721c24; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ OAuth Error</h1>
          <p><strong>Error:</strong> <code>${req.query.error}</code></p>
          <p><strong>Message:</strong> ${req.query.message || 'No message provided'}</p>
        </div>
      </body>
      </html>
    `);
  } else {
    console.log('⚠️ No credentials in query params');
    console.log('Full URL:', req.url);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Callback</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          .warning { background: #fff3cd; border: 1px solid #ffeeba; padding: 20px; border-radius: 8px; color: #856404; }
          h1 { color: #856404; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        </style>
        <script>
          // Check for hash fragment
          if (window.location.hash) {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            if (params.get('userId') && params.get('secret')) {
              document.addEventListener('DOMContentLoaded', () => {
                document.getElementById('content').innerHTML = \`
                  <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; color: #155724;">
                    <h1>✅ OAuth Working! (Hash Fragment)</h1>
                    <p><strong>User ID:</strong> <code>\${params.get('userId')}</code></p>
                    <p><strong>Secret:</strong> <code>\${params.get('secret').substring(0, 20)}...</code></p>
                    <p>Credentials were returned in the hash fragment!</p>
                  </div>
                \`;
              });
            }
          }
        </script>
      </head>
      <body>
        <div id="content">
          <div class="warning">
            <h1>⚠️ No Credentials Found</h1>
            <p>No OAuth credentials were found in the callback.</p>
            <p>URL: <code>${req.url}</code></p>
            <p>Check the browser console for any hash fragments.</p>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Server running at http://localhost:${port}`);
  console.log('Opening browser...\n');
  
  open(`http://localhost:${port}`).catch(() => {
    console.log(`Please open: http://localhost:${port}`);
  });
});
