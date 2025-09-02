#!/usr/bin/env node

// Debug OAuth callback to see what's being received
const express = require('express');
require('dotenv').config({ path: '.env.local' });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8789;

const app = express();

console.log('Debug OAuth Server');
console.log('==================');
console.log('Endpoint:', endpoint);
console.log('Project:', projectId);
console.log('');

// Main page
app.get('/', (req, res) => {
  const successUrl = `http://localhost:${port}/debug`;
  const failureUrl = `http://localhost:${port}/debug`;
  
  // Try different OAuth URL formats
  const tokenUrl = `${endpoint}/account/sessions/oauth2/google/token?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
  const standardUrl = `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Debug</title>
      <style>
        body {
          font-family: monospace;
          max-width: 1200px;
          margin: 40px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .url-box {
          background: #f9f9f9;
          border: 1px solid #ddd;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          word-break: break-all;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          margin: 10px 10px 10px 0;
          background: #4285f4;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
        .btn.alt { background: #34a853; }
        .note {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        pre {
          background: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🔍 OAuth Debug Tool</h1>
        
        <div class="note">
          <strong>⚠️ Important:</strong> Make sure you have added <code>localhost</code> as a Web platform in your Appwrite Console:
          <ol>
            <li>Go to Appwrite Console → Your Project</li>
            <li>Settings → Platforms → Add Platform → Web</li>
            <li>Add: <code>localhost</code> (without http:// or port)</li>
          </ol>
        </div>
        
        <h2>Method 1: Token Flow (Recommended)</h2>
        <div class="url-box">
          <strong>URL:</strong><br>
          <code>${tokenUrl}</code>
        </div>
        <a href="${tokenUrl}" class="btn">Try Token Flow →</a>
        
        <h2>Method 2: Standard Flow</h2>
        <div class="url-box">
          <strong>URL:</strong><br>
          <code>${standardUrl}</code>
        </div>
        <a href="${standardUrl}" class="btn alt">Try Standard Flow →</a>
        
        <h2>Current Configuration:</h2>
        <pre>
Project ID: ${projectId}
Endpoint: ${endpoint}
Success URL: ${successUrl}
Failure URL: ${failureUrl}
        </pre>
        
        <h2>Expected Callback Parameters:</h2>
        <ul>
          <li><strong>Token Flow:</strong> ?userId=xxx&secret=xxx</li>
          <li><strong>Standard Flow:</strong> Might set cookies instead</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// Debug endpoint - captures ALL query params and headers
app.get('/debug', (req, res) => {
  console.log('\n=== OAuth Callback Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Full URL:', req.url);
  console.log('Query Params:', JSON.stringify(req.query, null, 2));
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Cookies:', req.headers.cookie || 'None');
  console.log('================================\n');
  
  const hasUserId = !!req.query.userId;
  const hasSecret = !!req.query.secret;
  const hasError = !!req.query.error;
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Callback Debug</title>
      <style>
        body {
          font-family: monospace;
          max-width: 1200px;
          margin: 40px auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        pre {
          background: #f4f4f4;
          padding: 15px;
          border-radius: 4px;
          overflow-x: auto;
          border: 1px solid #ddd;
        }
        .status-box {
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          border: 2px solid;
        }
        .status-box.success {
          background: #d4edda;
          border-color: #c3e6cb;
        }
        .status-box.error {
          background: #f8d7da;
          border-color: #f5c6cb;
        }
        .status-box.warning {
          background: #fff3cd;
          border-color: #ffeeba;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>OAuth Callback Debug Results</h1>
        
        ${hasUserId && hasSecret ? `
          <div class="status-box success">
            <h2 class="success">✅ SUCCESS - Credentials Received!</h2>
            <p>OAuth is working correctly. You received both userId and secret.</p>
          </div>
        ` : hasError ? `
          <div class="status-box error">
            <h2 class="error">❌ ERROR - OAuth Failed</h2>
            <p>Error: ${req.query.error}</p>
            <p>Message: ${req.query.message || 'No message provided'}</p>
          </div>
        ` : `
          <div class="status-box warning">
            <h2 class="warning">⚠️ WARNING - No Credentials</h2>
            <p>The callback was reached but no userId/secret were provided.</p>
            <p>Possible issues:</p>
            <ul>
              <li>localhost not added as a Web platform in Appwrite</li>
              <li>Using wrong OAuth endpoint (try token vs standard)</li>
              <li>Google OAuth not properly configured in Appwrite</li>
            </ul>
          </div>
        `}
        
        <h2>Received Query Parameters:</h2>
        <pre>${JSON.stringify(req.query, null, 2)}</pre>
        
        <h2>Received Headers:</h2>
        <pre>${JSON.stringify(req.headers, null, 2)}</pre>
        
        <h2>Cookies:</h2>
        <pre>${req.headers.cookie || 'No cookies received'}</pre>
        
        <h2>What to check:</h2>
        <ol>
          <li><strong>If you see userId and secret:</strong> OAuth is working! ✅</li>
          <li><strong>If you see an error:</strong> Check the error message above</li>
          <li><strong>If no parameters:</strong> 
            <ul>
              <li>Verify localhost is added as a Web platform in Appwrite Console</li>
              <li>Check that Google OAuth is enabled in Appwrite Auth settings</li>
              <li>Ensure the OAuth consent screen is configured in Google Cloud Console</li>
            </ul>
          </li>
        </ol>
        
        <p><a href="/">← Try Again</a></p>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`\n🔍 OAuth Debug Server Running`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\n⚠️  Make sure 'localhost' is added as a Web platform in Appwrite!`);
  console.log(`   Go to: Appwrite Console → Project → Settings → Platforms\n`);
});
