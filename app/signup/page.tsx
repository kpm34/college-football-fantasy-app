'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Success! Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#5B2B8C' }}>
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: '#FFF4EC', border: '1px solid #9256A4', borderTop: '4px solid #EC0B8F' }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#5B2B8C' }}>Create Account</h1>
        {error && <p className="mb-3" style={{ color: '#B41F24' }}>{error}</p>}
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#6B4A35' }}>Name</label>
            <input className="w-full px-3 py-2 rounded-md" style={{ backgroundColor: '#FFFFFF', color: '#5B2B8C', border: '1px solid #9256A4' }} placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm mb-1" style={{ color: '#6B4A35' }}>Email</label>
            <input className="w-full px-3 py-2 rounded-md" style={{ backgroundColor: '#FFFFFF', color: '#5B2B8C', border: '1px solid #9256A4' }} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm mb-1" style={{ color: '#6B4A35' }}>Password</label>
            <input className="w-full px-3 py-2 rounded-md" style={{ backgroundColor: '#FFFFFF', color: '#5B2B8C', border: '1px solid #9256A4' }} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        
        <button disabled={loading} className="w-full mt-4 rounded-md px-4 py-2 disabled:opacity-60" style={{ backgroundColor: '#9256A4', color: '#FFFFFF' }}>{loading ? 'Creating...' : 'Sign Up'}</button>
        
        <p className="text-sm mt-4" style={{ color: '#6B4A35' }}>
          Already have an account? <Link href="/login" className="underline" style={{ color: '#EC0B8F' }}>Login</Link>
        </p>
      </form>
    </main>
  );
}