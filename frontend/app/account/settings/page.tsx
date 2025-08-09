'use client';

import { account } from '@/lib/appwrite';
import { useEffect, useState } from 'react';

export default function AccountSettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await account.get();
        setName(me.name || '');
        setEmail(me.email);
      } catch (e: any) {
        setError('Please login first.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await account.updateName(name || undefined);
      setMessage('Profile updated');
    } catch (e: any) {
      setError(e?.message || 'Update failed');
    }
  }

  if (loading) return <main className="min-h-screen flex items-center justify-center text-white">Loading...</main>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#4A1626] via-[#5C1F30] to-[#3A1220] flex items-center justify-center px-4">
      <form onSubmit={saveProfile} className="w-full max-w-md bg-white/10 backdrop-blur rounded-xl p-6 border border-white/15">
        <h1 className="text-2xl font-bold text-white mb-4">Account Settings</h1>
        {message && <p className="text-green-300 mb-3">{message}</p>}
        {error && <p className="text-red-300 mb-3">{error}</p>}
        <label className="block text-white/80 text-sm mb-1">Email</label>
        <input className="w-full mb-3 px-3 py-2 rounded-md bg-white/50 text-black/70" value={email} disabled />
        <label className="block text-white/80 text-sm mb-1">Name</label>
        <input className="w-full mb-4 px-3 py-2 rounded-md bg-white/90 text-black" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="w-full rounded-md px-4 py-2 bg-white/10 hover:bg-white/15 text-white">Save</button>
      </form>
    </main>
  );
}


