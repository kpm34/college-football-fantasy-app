'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { APPWRITE_PUBLIC_CONFIG } from '@/lib/appwrite-config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Use our secure server-side API route - no CORS issues!
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401 || data.code === 401) {
          throw new Error('Invalid email or password');
        } else if (data.message) {
          throw new Error(data.message);
        } else {
          throw new Error('Login failed');
        }
      }

      // Success! Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#5B2B8C' }}>
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl p-8 shadow-xl" style={{ backgroundColor: '#FFF4EC', border: '1px solid #9256A4', borderTop: '4px solid #EC0B8F' }}>
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: '#5B2B8C' }}>Welcome Back</h1>
        {error && <p className="mb-4 text-center py-2 px-3 rounded-lg" style={{ backgroundColor: 'rgba(180,31,36,0.12)', color: '#B41F24' }}>{error}</p>}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm mb-2 font-medium" style={{ color: '#6B4A35' }}>Email</label>
            <input
              id="email"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors" 
              style={{ borderColor: '#9256A4', backgroundColor: '#FFFFFF', color: '#5B2B8C' }}
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm mb-2 font-medium" style={{ color: '#6B4A35' }}>Password</label>
            <input 
              id="password"
              className="w-full px-4 py-3 rounded-lg border focus:outline-none transition-colors" 
              style={{ borderColor: '#9256A4', backgroundColor: '#FFFFFF', color: '#5B2B8C' }}
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
            />
          </div>
        </div>
        
        <button disabled={loading} className="w-full mt-6 rounded-lg px-4 py-3 font-semibold disabled:opacity-60 transition-colors" style={{ backgroundColor: '#9256A4', color: '#FFFFFF' }}>{loading ? 'Logging in...' : 'Login'}</button>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: '1px solid #E6CFBF' }}></div></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ color: '#6B4A35' }}>Or continue with</span>
            </div>
          </div>
          
          <div className="mt-4">
            <OAuthButtons />
          </div>
        </div>
        
        {process.env.NEXT_PUBLIC_DISABLE_SIGNUPS !== 'true' && (
          <p className="text-sm mt-6 text-center" style={{ color: '#6B4A35' }}>
            Don't have an account? <Link href="/signup" className="font-semibold hover:underline" style={{ color: '#EC0B8F' }}>Sign up</Link>
          </p>
        )}
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 rounded text-xs" style={{ backgroundColor: '#9256A4', color: '#FFF4EC' }}>
            <p>Endpoint: {APPWRITE_PUBLIC_CONFIG.endpoint}</p>
            <p>Project: {APPWRITE_PUBLIC_CONFIG.projectId}</p>
            <p>Domain: {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}</p>
          </div>
        )}
      </form>
    </main>
  );
}

function OAuthButtons() {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);
  const router = useRouter();
  
  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    
    try {
      // Get OAuth configuration from our API
      const response = await fetch(`/api/auth/oauth/${provider}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to get OAuth configuration');
      }
      
      // Import Appwrite client-side SDK
      const { Client, Account, OAuthProvider } = await import('appwrite');
      
      // Initialize client
      const client = new Client()
        .setEndpoint(APPWRITE_PUBLIC_CONFIG.endpoint)
        .setProject(APPWRITE_PUBLIC_CONFIG.projectId);
      
      const account = new Account(client);
      
      // Initiate OAuth2 session
      const providerName = provider === 'google' ? OAuthProvider.Google : OAuthProvider.Apple;
      
      // This will redirect to the OAuth provider
      await account.createOAuth2Session(
        providerName,
        data.successUrl,
        data.failureUrl
      );
      
    } catch (error) {
      console.error('OAuth error:', error);
      setLoading(null);
      // Show error message to user
      if (error instanceof Error) {
        alert(`OAuth login failed: ${error.message}`);
      }
    }
  };
  
  return (
    <div className="space-y-3">
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
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>
      
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
    </div>
  );
}


