'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Client, Account } from 'appwrite'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      try {
        console.log('OAuth callback - Starting...');
        console.log('URL search params:', searchParams.toString());
        
        // Initialize Appwrite client
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
        
        const account = new Account(client)
        
        // Check if we have a session
        try {
          const session = await account.getSession('current')
          console.log('OAuth session found:', session.$id)
          
          // Get user details
          const user = await account.get()
          console.log('OAuth user:', user.email)
          
          // Now we need to sync this session with our backend
          // Call our API to create a server-side session
          const response = await fetch('/api/auth/sync-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              sessionId: session.$id,
              secret: session.secret,
              userId: user.$id
            })
          });
          
          if (response.ok) {
            console.log('Session synced with backend');
            // Session synced! Redirect to dashboard
            router.push('/dashboard');
          } else {
            console.error('Failed to sync session with backend');
            setError('Failed to complete sign in. Please try again.');
          }
        } catch (e) {
          console.error('No session after OAuth callback:', e)
          
          // Check if we got error in URL params
          const errorParam = searchParams.get('error')
          if (errorParam) {
            console.error('OAuth error from Appwrite:', errorParam)
            setError(`Authentication failed: ${errorParam}`)
          } else {
            setError('No session found. Please try signing in again.')
          }
          
          // Wait a bit then redirect to login
          setTimeout(() => {
            router.push('/login?error=oauth_session_failed')
          }, 3000)
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        setError('An unexpected error occurred. Please try again.')
        
        setTimeout(() => {
          router.push('/login?error=oauth_callback_failed')
        }, 3000)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#5B2B8C' }}>
      <div className="text-center">
        {!error ? (
          <>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Completing sign in...</h2>
            <p className="text-white/70">Please wait while we set up your session</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sign in failed</h2>
            <p className="text-white/70 mb-2">{error}</p>
            <p className="text-white/50 text-sm">Redirecting to login page...</p>
          </>
        )}
      </div>
    </main>
  )
}