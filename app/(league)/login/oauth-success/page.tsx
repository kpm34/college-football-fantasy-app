'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const userId = currentUrl.searchParams.get('userId');
        const secret = currentUrl.searchParams.get('secret');

        // Token flow: both userId and secret are provided
        if (userId && secret) {
          console.log('OAuth token flow detected with userId:', userId);
          
          // First, create a session using the userId and secret
          const { Client, Account } = await import('appwrite');
          const client = new Client()
            .setEndpoint('https://nyc.cloud.appwrite.io/v1')
            .setProject('college-football-fantasy-app');

          const account = new Account(client);
          
          try {
            // Create session with the OAuth token
            const session = await account.createSession(userId, secret);
            console.log('Session created:', session.$id);
            
            // Now sync the session to our backend
            await fetch('/api/auth/sync-oauth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ secret: session.secret }),
            });
          } catch (sessionError) {
            console.error('Failed to create session:', sessionError);
            // Try syncing the secret directly as fallback
            await fetch('/api/auth/sync-oauth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ secret }),
            });
          }
        } else if (secret) {
          // Direct secret flow
          await fetch('/api/auth/sync-oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ secret }),
          });
        } else {
          // Fallback: try to get session from existing client session
          const { Client, Account } = await import('appwrite');
          const client = new Client()
            .setEndpoint('https://nyc.cloud.appwrite.io/v1')
            .setProject('college-football-fantasy-app');

          const account = new Account(client);
          
          try {
            // Check if we already have a session
            const session = await account.getSession('current');
            console.log('Existing session found:', session.$id);
            
            // Create JWT and sync
            const { jwt } = await account.createJWT();
            await fetch('/api/auth/sync-oauth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ jwt }),
            });
          } catch (e) {
            console.error('No session available:', e);
            router.replace('/login?error=oauth_no_session');
            return;
          }
        }
        
        // Success - redirect to dashboard
        router.replace('/dashboard');
      } catch (e) {
        console.error('OAuth sync failed', e);
        router.replace('/login?error=oauth_sync_failed');
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-white/70">Completing sign-in…</div>
    </main>
  );
}
