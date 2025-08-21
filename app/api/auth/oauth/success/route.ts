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
        <script>
          (function () {
            const params = new URLSearchParams(location.search || location.hash.substring(1));
            const userId = params.get('userId');
            const secret = params.get('secret');
            if (!userId || !secret) {
              location.replace('/login');
              return;
            }
            fetch('/api/auth/sync-oauth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId, secret })
            }).then(() => {
              document.cookie = 'oauth_success=1;path=/;max-age=120;SameSite=Lax';
              location.replace('/dashboard');
            }).catch(() => location.replace('/login'));
          }());
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

