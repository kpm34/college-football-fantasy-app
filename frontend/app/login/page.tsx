'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <main className="min-h-screen bg-gradient-to-br from-[#6B3AA0] via-[#A374B5] to-[#E73C7E] flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md login-card backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h1>
        {error && <p className="text-red-200 mb-4 text-center bg-red-500/20 py-2 px-3 rounded-lg">{error}</p>}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[#F7EAE1] text-sm mb-2 font-medium">Email</label>
            <input 
              id="email"
              className="w-full px-4 py-3 rounded-lg login-input border border-[#D4A5A5] focus:border-[#E73C7E] focus:outline-none focus:ring-2 focus:ring-[#E73C7E]/20 transition-all" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-[#F7EAE1] text-sm mb-2 font-medium">Password</label>
            <input 
              id="password"
              className="w-full px-4 py-3 rounded-lg login-input border border-[#D4A5A5] focus:border-[#E73C7E] focus:outline-none focus:ring-2 focus:ring-[#E73C7E]/20 transition-all" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
            />
          </div>
        </div>
        
        <button 
          disabled={loading} 
          className="w-full mt-6 rounded-lg px-4 py-3 login-button text-white font-semibold disabled:opacity-60 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#F7EAE1]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-[#F7EAE1]">Or continue with</span>
            </div>
          </div>
          
          <div className="mt-4">
            <OAuthButtons />
          </div>
        </div>
        
        <p className="text-[#F7EAE1] text-sm mt-6 text-center">
          Don't have an account? <Link href="/signup" className="text-white font-semibold hover:underline">Sign up</Link>
        </p>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-black/20 rounded text-xs text-white/70">
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
  // TODO: Implement OAuth with server-side flow
  return (
    <div className="space-y-2">
      <button type="button" disabled className="w-full rounded-md px-4 py-2 bg-gray-600 text-gray-400 cursor-not-allowed">OAuth coming soon</button>
    </div>
  );
}


