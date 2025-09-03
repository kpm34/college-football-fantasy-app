#!/usr/bin/env node

// OAuth solution - handling Appwrite 1.8.0 specific behavior
require('dotenv').config({ path: '.env.local' });
const express = require('express');
const open = require('open');

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const port = 8796;

const app = express();

console.log('🔧 OAuth Solution for Appwrite 1.8.0');
console.log('====================================\n');
console.log('Project:', projectId);
console.log('Endpoint:', endpoint);
console.log('');

// Enable cookie parsing
app.use((req, res, next) => {
  // Parse cookies manually
  const cookieHeader = req.headers.cookie || '';
  req.cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    if (parts.length === 2) {
      req.cookies[parts[0].trim()] = parts[1].trim();
    }
  });
  next();
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>OAuth Solution</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 1000px;
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
        .solution {
          background: #e7f3ff;
          border-left: 4px solid #007bff;
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
          padding: 12px 24px;
          background: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          margin: 10px 10px 10px 0;
        }
        .btn:hover { background: #218838; }
        code {
          background: #f4f4f4;
          padding: 4px 8px;
          border-radius: 3px;
          font-family: monospace;
        }
        .working-code {
          background: #263238;
          color: #aed581;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ OAuth Solution</h1>
        
        <div class="solution">
          <h3>The Issue:</h3>
          <p>Appwrite 1.8.0 returns OAuth credentials differently than expected. The credentials might be:</p>
          <ul>
            <li>In cookies (a_session_xxx)</li>
            <li>In hash fragments (#userId=xxx&secret=xxx)</li>
            <li>Or need to be fetched via a separate API call</li>
          </ul>
        </div>
        
        <div class="test">
          <h3>Final Test - Complete OAuth Flow</h3>
          <p>This will handle all possible response formats:</p>
          <a href="${endpoint}/account/sessions/oauth2/google?success=${encodeURIComponent('http://localhost:' + port + '/complete-callback')}&failure=${encodeURIComponent('http://localhost:' + port + '/complete-callback')}&project=${projectId}" 
             class="btn">
            Test Complete OAuth Flow →
          </a>
        </div>
        
        <div class="test">
          <h3>Working Implementation for Your App:</h3>
          <div class="working-code">
// In your Next.js app, use this pattern:

// 1. Redirect to OAuth
const oauthUrl = \`\${endpoint}/account/sessions/oauth2/google?
  success=\${encodeURIComponent(window.location.origin + '/api/auth/callback')}
  &failure=\${encodeURIComponent(window.location.origin + '/api/auth/callback')}
  &project=\${projectId}\`;

window.location.href = oauthUrl;

// 2. In /api/auth/callback/route.ts
import { cookies } from 'next/headers';
import { Client, Account } from 'node-appwrite';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Check for credentials in query
  const userId = url.searchParams.get('userId');
  const secret = url.searchParams.get('secret');
  
  if (userId && secret) {
    // Create session
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
    
    const account = new Account(client);
    
    try {
      // Create session from OAuth credentials
      const session = await account.createSession(userId, secret);
      
      // Set cookie
      cookies().set('session', session.$id, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      
      return Response.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('OAuth error:', error);
      return Response.redirect(new URL('/login?error=oauth', request.url));
    }
  }
  
  // Check for Appwrite session cookie
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('a_session_' + projectId);
  
  if (sessionCookie) {
    // Session exists via cookie
    return Response.redirect(new URL('/dashboard', request.url));
  }
  
  // No credentials found
  return Response.redirect(new URL('/login?error=no_credentials', request.url));
}
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Complete callback handler that checks everything
app.get('/complete-callback', async (req, res) => {
  console.log('\n=== Complete OAuth Callback ===');
  console.log('Time:', new Date().toISOString());
  
  // 1. Check query parameters
  console.log('Query params:', req.query);
  
  // 2. Check cookies
  console.log('Cookies:', req.cookies);
  
  // 3. Check headers
  console.log('Relevant headers:', {
    cookie: req.headers.cookie,
    referer: req.headers.referer
  });
  
  const { userId, secret, error } = req.query;
  
  // Check for Appwrite session cookies
  const sessionCookie = Object.keys(req.cookies).find(key => 
    key.startsWith('a_session_') || 
    key.includes('session') ||
    key === `a_session_${projectId}`
  );
  
  if (userId && secret) {
    console.log('✅ SUCCESS - Credentials in query!');
    res.send(`
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #d4edda;">
        <h1 style="color: #155724;">🎉 OAuth Works!</h1>
        <p>Credentials received in query parameters!</p>
        <p>User ID: <code>${userId}</code></p>
        <p>Secret: <code>${secret.substring(0, 20)}...</code></p>
        <h3>Use this pattern in your app!</h3>
      </body>
      </html>
    `);
  } else if (sessionCookie) {
    console.log('✅ SUCCESS - Session cookie found!');
    res.send(`
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #d4edda;">
        <h1 style="color: #155724;">🎉 OAuth Works!</h1>
        <p>Session created via cookie!</p>
        <p>Cookie name: <code>${sessionCookie}</code></p>
        <p>Cookie value: <code>${req.cookies[sessionCookie]?.substring(0, 20)}...</code></p>
        <h3>Appwrite is using cookie-based sessions</h3>
        <p>You'll need to handle this differently in your app</p>
      </body>
      </html>
    `);
  } else if (error) {
    console.log('❌ OAuth error:', error);
    res.send(`
      <html>
      <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #f8d7da;">
        <h1 style="color: #721c24;">❌ OAuth Error</h1>
        <p>Error: ${error}</p>
        <p>${req.query.message || ''}</p>
      </body>
      </html>
    `);
  } else {
    console.log('⚠️ No credentials found anywhere');
    
    // Try to check if it's in the hash (client-side)
    res.send(`
      <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 40px; background: #fff3cd; }
          .container { max-width: 800px; margin: 0 auto; }
          h1 { color: #856404; }
          pre { background: white; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Checking for credentials...</h1>
          
          <h3>Query Parameters:</h3>
          <pre>${JSON.stringify(req.query, null, 2) || 'None'}</pre>
          
          <h3>Cookies:</h3>
          <pre>${JSON.stringify(req.cookies, null, 2) || 'None'}</pre>
          
          <h3>Hash Fragment:</h3>
          <pre id="hash">Checking...</pre>
          
          <script>
            // Check hash
            const hash = window.location.hash.substring(1);
            document.getElementById('hash').textContent = hash || 'None';
            
            if (hash) {
              const params = new URLSearchParams(hash);
              const userId = params.get('userId');
              const secret = params.get('secret');
              
              if (userId && secret) {
                document.body.style.background = '#d4edda';
                document.body.innerHTML = '<div style="text-align: center; padding: 40px;">' +
                  '<h1 style="color: #155724;">✅ Found in Hash!</h1>' +
                  '<p>OAuth works but uses hash fragments!</p>' +
                  '<p>User ID: ' + userId + '</p>' +
                  '<p>You need to handle this client-side in your app</p>' +
                  '</div>';
              }
            }
          </script>
          
          <h3>What this means:</h3>
          <p>If no credentials are found anywhere, the issue might be:</p>
          <ul>
            <li>Google OAuth app is in test mode and your email isn't whitelisted</li>
            <li>The OAuth consent screen isn't properly configured</li>
            <li>There's a mismatch between the Appwrite project ID and what's configured</li>
          </ul>
          
          <h3>Final Check - Google Cloud Console:</h3>
          <ol>
            <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank">Google Cloud Console</a></li>
            <li>Click on your OAuth 2.0 Client ID</li>
            <li>Check "OAuth consent screen" - is it in Production or Testing mode?</li>
            <li>If in Testing mode, is your email (kashpm2002@gmail.com) in the test users list?</li>
          </ol>
        </div>
      </body>
      </html>
    `);
  }
});

app.listen(port, () => {
  console.log(`\n🚀 OAuth Solution Server`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`\nThis handles all possible OAuth response formats.`);
  console.log(`\nOpening browser...`);
  
  open(`http://localhost:${port}`).catch(() => {
    console.log('Please open: http://localhost:' + port);
  });
});
