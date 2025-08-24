'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const currentUrl = new URL(window.location.href);
        const secret = currentUrl.searchParams.get('secret');

        // Preferred: use secret directly when available (token=true flow)
        if (secret) {
          await fetch('/api/auth/sync-oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ secret }),
          });
        } else {
          // Fallback for legacy browsers / flows: create JWT then exchange
          const { Client, Account } = await import('appwrite');
          const client = new Client()
            .setEndpoint('https://nyc.cloud.appwrite.io/v1')
            .setProject('college-football-fantasy-app');

          const account = new Account(client);
          const { jwt } = await account.createJWT();

          await fetch('/api/auth/sync-oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ jwt }),
          });
        }
      } catch (e) {
        console.error('OAuth sync failed', e);
      }
      router.replace('/dashboard');
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-white/70">Completing sign-in…</div>
    </main>
  );
}
