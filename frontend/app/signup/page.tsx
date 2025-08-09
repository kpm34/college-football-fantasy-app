'use client';

import { account } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
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
      await account.create(ID.unique(), email, password, name || undefined);
      await account.createEmailSession(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4A1626] via-[#5C1F30] to-[#3A1220] flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white/10 backdrop-blur rounded-xl p-6 border border-white/15">
        <h1 className="text-2xl font-bold text-white mb-4">Create Account</h1>
        {error && <p className="text-red-300 mb-3">{error}</p>}
        <label className="block text-white/80 text-sm mb-1">Name</label>
        <input className="w-full mb-3 px-3 py-2 rounded-md bg-white/90 text-black" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block text-white/80 text-sm mb-1">Email</label>
        <input className="w-full mb-3 px-3 py-2 rounded-md bg-white/90 text-black" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-white/80 text-sm mb-1">Password</label>
        <input className="w-full mb-4 px-3 py-2 rounded-md bg-white/90 text-black" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={loading} className="w-full rounded-md px-4 py-2 bg-[#8091BB] hover:bg-[#6B7CA6] text-white disabled:opacity-60">{loading ? 'Creating...' : 'Sign Up'}</button>
        <p className="text-white/80 text-sm mt-4">Already have an account? <Link href="/login" className="underline">Login</Link></p>
      </form>
    </main>
  );
}


