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
                .setEndpoint('${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'}')
                .setProject('${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'}');
              
              const account = new Account(client);
              
              // Get current session
              const session = await account.getSession('current');
              
              // Sync with server
              const response = await fetch('/api/auth/sync-oauth', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  sessionId: session.$id,
                  userId: session.userId
                })
              });
              
              if (response.ok) {
                // Redirect to dashboard
                window.location.href = '/dashboard';
              } else {
                throw new Error('Failed to sync session');
              }
            } catch (error) {
              console.error('OAuth sync error:', error);
              alert('Login failed. Please try again.');
              window.location.href = '/login';
            }
          }
          
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
