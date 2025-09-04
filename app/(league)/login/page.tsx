'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { Suspense, useState } from 'react'
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton'

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
  const searchParams = useSearchParams()

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

        {/* OAuth Section */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #E6CFBF' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white" style={{ color: '#6B4A35', backgroundColor: '#FFF4EC' }}>
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4">
            <GoogleAuthButton />
          </div>
        </div>

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
    </main>
  )
}

