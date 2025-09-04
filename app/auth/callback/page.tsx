'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Client, Account } from 'appwrite'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
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
          
          // Session exists! The Appwrite cookies are already set
          // Just redirect to dashboard
          router.push('/dashboard')
        } catch (e) {
          console.error('No session after OAuth callback:', e)
          router.push('/login?error=oauth_session_failed')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        router.push('/login?error=oauth_callback_failed')
      }
    }

    handleCallback()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#5B2B8C' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Completing sign in...</h2>
        <p className="text-white/70">Please wait while we set up your session</p>
      </div>
    </main>
  )
}