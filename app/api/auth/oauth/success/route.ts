import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Create a page that will sync the OAuth session
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Completing login...</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0B0E13;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .container {
            text-align: center;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 20px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <p>Completing your login...</p>
        </div>
        <script type="module">
          import { Client, Account } from 'https://cdn.jsdelivr.net/npm/appwrite@14.0.0/+esm';
          
          async function syncSession() {
            try {
              const client = new Client()
                .setEndpoint('https://nyc.cloud.appwrite.io/v1')
                .setProject('college-football-fantasy-app');
              
              const account = new Account(client);
              
              // Try to get current session
              let session;
              try {
                session = await account.getSession('current');
                console.log('OAuth session found:', session);
              } catch (sessionError) {
                console.error('No session found:', sessionError);
                console.error('Session error details:', {
                  message: sessionError.message,
                  code: sessionError.code,
                  type: sessionError.type
                });
                
                // Show error details on the page for debugging
                const container = document.querySelector('.container');
                if (container) {
                  container.innerHTML = '<p style="color: #ef4444;">OAuth session not found</p>' +
                    '<p style="font-size: 12px; margin-top: 10px;">Error: ' + (sessionError.message || 'Unknown error') + '</p>' +
                    '<p style="font-size: 12px;">Code: ' + (sessionError.code || 'N/A') + '</p>' +
                    '<p style="font-size: 12px; margin-top: 20px;">This usually means:</p>' +
                    '<ul style="font-size: 12px; text-align: left; max-width: 400px; margin: 10px auto;">' +
                    '<li>Google OAuth is not properly configured in Appwrite</li>' +
                    '<li>The OAuth flow was cancelled or failed</li>' +
                    '<li>Session cookies are being blocked</li>' +
                    '</ul>' +
                    '<p style="margin-top: 20px;"><a href="/login" style="color: #3B82F6;">Return to login</a></p>';
                }
                return;
              }
              
              // Sync with server
              const response = await fetch('/api/auth/sync-oauth', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                  sessionId: session.$id,
                  userId: session.userId
                })
              });
              
              if (response.ok) {
                // Redirect to dashboard
                console.log('Session synced successfully, redirecting...');
                window.location.href = '/dashboard';
              } else {
                const error = await response.json();
                console.error('Sync failed:', error);
                throw new Error('Failed to sync session');
              }
            } catch (error) {
              console.error('OAuth sync error:', error);
              setTimeout(() => {
                alert('Login failed. Please try again.');
                window.location.href = '/login';
              }, 1000);
            }
          }
          
          // Add a timeout to prevent infinite loading
          setTimeout(() => {
            const container = document.querySelector('.container');
            if (container && container.querySelector('.spinner')) {
              container.innerHTML = '<p>Login is taking longer than expected...</p><p><a href="/login" style="color: #3B82F6;">Return to login</a></p>';
            }
          }, 10000);
          
          syncSession();
        </script>
      </body>
    </html>
  `;
  
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

