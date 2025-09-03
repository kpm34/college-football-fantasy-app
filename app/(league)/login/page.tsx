'use client'

import { client } from '@lib/appwrite'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { Suspense, useState } from 'react'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-white/70">Loading...</div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [showDebug, setShowDebug] = useState(true) // Always show debug in dev
  const searchParams = useSearchParams()
  // OAuth providers – toggle via env vars
  const googleAvailable = process.env.NEXT_PUBLIC_ENABLE_OAUTH_GOOGLE !== 'false'
  const appleAvailable = process.env.NEXT_PUBLIC_ENABLE_OAUTH_APPLE === 'true'
  
  // Check authentication status on mount and after OAuth
  React.useEffect(() => {
    checkAuthStatus()
    
    // Check URL params for OAuth errors
    const urlError = searchParams?.get('error')
    const urlDetails = searchParams?.get('details')
    if (urlError) {
      setError(`OAuth Error: ${urlError}${urlDetails ? ` - ${urlDetails}` : ''}`)
    }
    
    // Only poll if we just came back from OAuth (has error or success params)
    // or if we detect an OAuth cookie
    let interval: NodeJS.Timeout | null = null
    if (urlError || searchParams?.get('success') || document.cookie.includes('oauth_')) {
      interval = setInterval(() => {
        checkAuthStatus()
      }, 3000) // Check every 3 seconds only when needed
      
      // Stop polling after 30 seconds
      setTimeout(() => {
        if (interval) clearInterval(interval)
      }, 30000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [searchParams])
  
  async function checkAuthStatus() {
    try {
      // Check cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {} as Record<string, string>)
      
      // Check Appwrite session
      const { Account } = await import('appwrite')
      const account = new Account(client)
      
      let session = null
      let user = null
      
      try {
        session = await account.getSession('current')
        user = await account.get()
      } catch (e) {
        // No active session
      }
      
      // Check our API
      let apiUser = null
      try {
        const response = await fetch('/api/auth/user', { 
          cache: 'no-store',
          credentials: 'include'
        })
        if (response.ok) {
          apiUser = await response.json()
        }
      } catch (e) {
        // API check failed
      }
      
      setDebugInfo({
        timestamp: new Date().toLocaleTimeString(),
        cookies: {
          count: Object.keys(cookies).length,
          hasAppwriteSession: Object.keys(cookies).some(k => k.includes('appwrite')),
          hasOAuthSuccess: cookies['oauth_success'] === 'true',
          relevantCookies: Object.entries(cookies)
            .filter(([k]) => k.includes('appwrite') || k.includes('session') || k.includes('oauth'))
            .map(([k, v]) => `${k}=${v?.substring(0, 20)}...`)
        },
        appwrite: {
          hasSession: !!session,
          sessionId: session?.$id,
          userId: user?.$id,
          userEmail: user?.email,
          userName: user?.name
        },
        api: {
          hasUser: !!apiUser,
          userId: apiUser?.$id || apiUser?.data?.$id,
          userEmail: apiUser?.email || apiUser?.data?.email
        },
        url: {
          origin: window.location.origin,
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash
        }
      })
      
      // If authenticated, show in debug panel but don't auto-redirect
      // (let user manually navigate or click a button)
      if (user && user.$id) {
        console.log('🎉 User authenticated! User can now go to dashboard')
        // Only redirect if we're coming from OAuth callback
        if (searchParams?.get('oauth_callback') === 'true' || window.location.hash.includes('userId')) {
          console.log('OAuth callback detected, redirecting to dashboard...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1500)
        }
      }
    } catch (err) {
      console.error('Auth check error:', err)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Use our secure server-side API route - no CORS issues!
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // ensure cookies from response are stored
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401 || data.code === 401) {
          throw new Error('Invalid email or password')
        } else if (data.message) {
          throw new Error(data.message)
        } else {
          throw new Error('Login failed')
        }
      }

      // Success! Redirect back if redirect param present
      const redirectParam = searchParams?.get('redirect')
      if (redirectParam) {
        try {
          const decoded = decodeURIComponent(redirectParam)
          // Only allow internal redirects
          if (decoded.startsWith('/')) {
            window.location.href = decoded
            return
          }
        } catch {}
      }
      // Fallback
      window.location.href = '/dashboard'
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#5B2B8C' }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl p-8 shadow-xl"
        style={{
          backgroundColor: '#FFF4EC',
          border: '1px solid #9256A4',
          borderTop: '4px solid #EC0B8F',
        }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#5B2B8C' }}>
          Welcome Back
        </h1>
        {error && (
          <p
            className="mb-4 text-center py-2 px-3 rounded-lg"
            style={{ backgroundColor: 'rgba(180,31,36,0.12)', color: '#B41F24' }}
          >
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm mb-2 font-medium"
              style={{ color: '#6B4A35' }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors"
              style={{ borderColor: '#9256A4', backgroundColor: '#FFFFFF', color: '#5B2B8C' }}
              type="email"
              autoComplete="email" // allow browser autofill email
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm mb-2 font-medium"
              style={{ color: '#6B4A35' }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors"
              style={{ borderColor: '#9256A4', backgroundColor: '#FFFFFF', color: '#5B2B8C' }}
              type="password"
              autoComplete="current-password" // allow browser autofill password
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full mt-6 rounded-lg px-4 py-3 font-semibold disabled:opacity-60 transition-colors"
          style={{ backgroundColor: '#9256A4', color: '#FFFFFF' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {(googleAvailable || appleAvailable) && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid #E6CFBF' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4" style={{ color: '#6B4A35' }}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-4">
              <OAuthButtons googleEnabled={googleAvailable} appleEnabled={appleAvailable} />
            </div>
          </div>
        )}

        {process.env.NEXT_PUBLIC_DISABLE_SIGNUPS !== 'true' && (
          <p className="text-sm mt-6 text-center" style={{ color: '#6B4A35' }}>
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold hover:underline"
              style={{ color: '#EC0B8F' }}
            >
              Sign up
            </Link>
          </p>
        )}
      </form>
      
      {/* Debug Panel - Shows auth status in real-time */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 w-96 max-h-[600px] overflow-auto rounded-xl shadow-2xl border-2"
          style={{ backgroundColor: '#1a1a1a', borderColor: '#EC0B8F', color: '#FFF4EC' }}
        >
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-white">🔍 Auth Debug Panel</h3>
              <button 
                onClick={() => setShowDebug(false)}
                className="text-gray-400 hover:text-white"
              >✕</button>
            </div>
            
            {/* Timestamp */}
            <div className="text-xs text-gray-400 mb-3">
              Last check: {debugInfo.timestamp || 'Loading...'}
            </div>
            
            {/* Quick Status */}
            <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#2a2a2a' }}>
              <div className="text-sm font-semibold mb-2 text-yellow-400">Quick Status</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Appwrite Session:</span>
                  <span className={debugInfo.appwrite?.hasSession ? 'text-green-400' : 'text-red-400'}>
                    {debugInfo.appwrite?.hasSession ? '✅ Active' : '❌ None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>API User:</span>
                  <span className={debugInfo.api?.hasUser ? 'text-green-400' : 'text-red-400'}>
                    {debugInfo.api?.hasUser ? '✅ Found' : '❌ None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cookies:</span>
                  <span className={debugInfo.cookies?.hasAppwriteSession ? 'text-green-400' : 'text-yellow-400'}>
                    {debugInfo.cookies?.count || 0} total
                  </span>
                </div>
              </div>
            </div>
            
            {/* Appwrite Details */}
            {debugInfo.appwrite && (
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#2a2a2a' }}>
                <div className="text-sm font-semibold mb-2 text-blue-400">Appwrite Client</div>
                <div className="space-y-1 text-xs font-mono">
                  {debugInfo.appwrite.hasSession ? (
                    <>
                      <div>Session ID: {debugInfo.appwrite.sessionId}</div>
                      <div>User ID: {debugInfo.appwrite.userId}</div>
                      <div>Email: {debugInfo.appwrite.userEmail}</div>
                      <div>Name: {debugInfo.appwrite.userName || 'Not set'}</div>
                    </>
                  ) : (
                    <div className="text-gray-500">No active session</div>
                  )}
                </div>
              </div>
            )}
            
            {/* API Status */}
            {debugInfo.api && (
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#2a2a2a' }}>
                <div className="text-sm font-semibold mb-2 text-green-400">API /auth/user</div>
                <div className="space-y-1 text-xs font-mono">
                  {debugInfo.api.hasUser ? (
                    <>
                      <div>User ID: {debugInfo.api.userId}</div>
                      <div>Email: {debugInfo.api.userEmail}</div>
                    </>
                  ) : (
                    <div className="text-gray-500">No user data from API</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Cookies */}
            {debugInfo.cookies && (
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#2a2a2a' }}>
                <div className="text-sm font-semibold mb-2 text-purple-400">Cookies ({debugInfo.cookies.count})</div>
                <div className="space-y-1 text-xs font-mono">
                  {debugInfo.cookies.relevantCookies?.length > 0 ? (
                    debugInfo.cookies.relevantCookies.map((cookie: string, i: number) => (
                      <div key={i} className="break-all text-gray-300">{cookie}</div>
                    ))
                  ) : (
                    <div className="text-gray-500">No auth-related cookies found</div>
                  )}
                  {debugInfo.cookies.hasOAuthSuccess && (
                    <div className="text-yellow-400 mt-2">⚠️ OAuth success cookie detected</div>
                  )}
                </div>
              </div>
            )}
            
            {/* URL Info */}
            {debugInfo.url && (
              <div className="mb-4 p-3 rounded" style={{ backgroundColor: '#2a2a2a' }}>
                <div className="text-sm font-semibold mb-2 text-orange-400">Current URL</div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="break-all">Origin: {debugInfo.url.origin}</div>
                  <div>Path: {debugInfo.url.pathname}</div>
                  {debugInfo.url.search && <div>Params: {debugInfo.url.search}</div>}
                  {debugInfo.url.hash && <div>Hash: {debugInfo.url.hash}</div>}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="space-y-2">
              {/* Show Dashboard button if authenticated */}
              {debugInfo.appwrite?.hasSession && (
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full px-3 py-2 text-xs rounded bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  ✅ Authenticated - Go to Dashboard
                </button>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => checkAuthStatus()}
                  className="flex-1 px-3 py-2 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white"
                >
                  🔄 Refresh Status
                </button>
                <button
                  onClick={() => {
                    document.cookie.split(";").forEach(c => {
                      document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                    });
                    checkAuthStatus();
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  🗑️ Clear Cookies
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle Debug Button */}
      {!showDebug && (
        <button
          onClick={() => setShowDebug(true)}
          className="fixed bottom-4 right-4 p-3 rounded-full shadow-lg"
          style={{ backgroundColor: '#EC0B8F', color: 'white' }}
        >
          🐛
        </button>
      )}
    </main>
  )
}

function OAuthButtons({
  googleEnabled,
  appleEnabled,
}: {
  googleEnabled: boolean
  appleEnabled: boolean
}) {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null)
  const router = useRouter()

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(provider)
    
    // Add debug logging
    console.log('🔐 Starting OAuth flow for:', provider)
    console.log('📍 Current location:', window.location.href)
    console.log('🔧 Environment:', {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      origin: window.location.origin
    })

    try {
      // Import Appwrite client-side SDK
      const { Account, OAuthProvider } = await import('appwrite')
      // Reuse shared initialized client to avoid project header mismatches
      const account = new Account(client)

      // Initiate OAuth2 session
      const providerName = provider === 'google' ? OAuthProvider.Google : OAuthProvider.Apple

      // Use static HTML handler to bypass Vercel protection
      if (providerName === 'google') {
        // Direct OAuth URL that we know works
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1'
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app'
        const origin = window.location.origin
        
        // Try using the oauth-handler.html for callback
        const successUrl = `${origin}/oauth-handler.html`
        const failureUrl = `${origin}/login?error=oauth_failed`

        console.log('🚀 Attempting Google OAuth with:', {
          endpoint,
          projectId,
          successUrl,
          failureUrl
        })

        // Use createOAuth2Session which properly handles the OAuth flow
        try {
          console.log('📞 Calling account.createOAuth2Session...')
          await account.createOAuth2Session(
            OAuthProvider.Google,
            successUrl,
            failureUrl
          )
        } catch (sessionError: any) {
          console.error('❌ OAuth session creation failed:', sessionError)
          
          // If createOAuth2Session fails, try the direct URL approach
          if (sessionError?.message?.includes('Missing required parameter')) {
            console.log('⚠️ Falling back to direct OAuth URL...')
            const oauthUrl = `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`
            console.log('🔗 Redirecting to:', oauthUrl)
            window.location.href = oauthUrl
          } else {
            throw sessionError
          }
        }
      } else {
        // Fallback for other providers
        const origin = window.location.origin
        const successUrl = `${origin}/oauth-handler.html`
        const failureUrl = `${origin}/oauth-handler.html?error=oauth_failed`

        console.log('OAuth URLs:', { successUrl, failureUrl, provider: providerName })

        // Use createOAuth2Token for the token flow (returns userId/secret)
        if (typeof window !== 'undefined') {
          const authUrl = await account.createOAuth2Token(providerName, successUrl, failureUrl)
          if (authUrl) {
            window.location.href = authUrl
          }
        }
      }
    } catch (error: any) {
      console.error('❌ OAuth error:', error)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        stack: error?.stack
      })
      setLoading(null)
      alert(`OAuth login failed: ${error?.message || 'Unknown error'}. Please check the console for details.`)
    }
  }

  return (
    <div className="space-y-3">
      {googleEnabled && (
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 text-gray-900 font-medium transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none"
        >
          {loading === 'google' ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      )}

      {appleEnabled && (
        <button
          type="button"
          onClick={() => handleOAuth('apple')}
          disabled={loading !== null}
          className="w-full flex items-center justify-center gap-3 rounded-lg px-4 py-3 bg-black hover:bg-gray-900 text-white font-medium transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none"
        >
          {loading === 'apple' ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
          )}
          <span>Continue with Apple</span>
        </button>
      )}
    </div>
  )
}
