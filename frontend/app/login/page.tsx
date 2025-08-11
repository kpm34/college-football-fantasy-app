'use client';

import { account } from '@/lib/appwrite';
import { createProxyAwareAccount } from '@/lib/appwrite-proxy';
import { useState, useEffect } from 'react';
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
      // Use proxy-aware account for production CORS workaround
      const isProduction = process.env.NODE_ENV === 'production' && typeof window !== 'undefined';
      const needsProxy = isProduction && window.location.hostname.includes('cfbfantasy.app');
      
      const authAccount = needsProxy ? createProxyAwareAccount() : account;
      const anyAccount: any = authAccount as any;
      
      if (typeof anyAccount.createEmailPasswordSession === 'function') {
        await anyAccount.createEmailPasswordSession(email, password);
      } else if (typeof anyAccount.createEmailSession === 'function') {
        await anyAccount.createEmailSession(email, password);
      } else if (typeof anyAccount.createSession === 'function') {
        await anyAccount.createSession(email, password);
      } else {
        throw new Error('Email/password login method not available in Appwrite SDK');
      }
      window.location.href = '/';
    } catch (err: any) {
      console.error('Login error:', err);
      
      // More specific error messages
      if (err?.code === 401) {
        setError('Invalid email or password');
      } else if (err?.message?.includes('CORS')) {
        setError('Domain not configured. Please check Appwrite platform settings.');
      } else if (err?.message?.includes('fetch')) {
        setError('Unable to connect to authentication service');
      } else {
        setError(err?.message || 'Login failed');
      }
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
  async function social(provider: 'google' | 'apple') {
    try {
      // Redirect-based OAuth with absolute URLs so we return to our site, not the Appwrite host
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${origin}/`;
      const failureUrl = `${origin}/login`;
      await account.createOAuth2Session(provider, successUrl, failureUrl);
    } catch (e) {
      console.error('OAuth failed', e);
    }
  }
  return (
    <div className="space-y-2">
      <button type="button" onClick={() => social('google')} className="w-full rounded-md px-4 py-2 bg-white text-black hover:bg-gray-200">Continue with Google</button>
      <button type="button" onClick={() => social('apple')} className="w-full rounded-md px-4 py-2 bg-black text-white hover:bg-black/90">Continue with Apple</button>
    </div>
  );
}


