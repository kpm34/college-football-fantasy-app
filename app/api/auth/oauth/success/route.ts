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
          async function syncSession() {
            try {
              // Dynamically import the Appwrite Web SDK (ESM build hosted on jsdelivr)
              const { Client, Account } = await import('https://cdn.jsdelivr.net/npm/appwrite@14.0.0/+esm');

              // Init client – use the same endpoint / project as the main app
              const client = new Client()
                .setEndpoint('https://nyc.cloud.appwrite.io/v1')
                .setProject('college-football-fantasy-app');

              const account = new Account(client);

              // Get the current user – this proves the OAuth session succeeded and also gives us userId
              const user = await account.get();

              // Fetch current session list to grab the session ID for this browser
              const { sessions } = await account.listSessions();
              const current = sessions.find((s) => s.current) || sessions[0];

              if (!current) throw new Error('No active session found');

              let uidParam = null;
              let secretParam = null;

              // First look at query string
              const urlParams = new URLSearchParams(window.location.search);
              uidParam = urlParams.get('userId');
              secretParam = urlParams.get('secret');

              // Some Appwrite versions append as hash fragment (#userId=...&secret=...)
              if (!secretParam && window.location.hash) {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                uidParam = uidParam || hashParams.get('userId');
                secretParam = hashParams.get('secret');
              }

              // Create a short-lived JWT for server verification
              const { jwt } = await account.createJWT();

              const payload = { jwt };

              await fetch('/api/auth/sync-oauth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
              });

              // Also drop a short-lived client cookie so useAuth hook forces re-check
              document.cookie = 'oauth_success=true; path=/; max-age=120; SameSite=Lax';

              // Redirect to dashboard
              window.location.href = '/dashboard';
            } catch (err) {
              console.error('OAuth sync error:', err);
              setTimeout(() => {
                alert('Login failed. Please try again.');
                window.location.href = '/login';
              }, 500);
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

