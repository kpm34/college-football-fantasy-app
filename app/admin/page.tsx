'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [subscriptions, setSubscriptions] = useState({
    appwrite: { status: 'Pro', features: 'Unlimited functions, 100GB storage, priority support' },
    vercel: { status: 'Pro', features: 'Advanced analytics, unlimited functions, team collaboration' },
    claude: { status: 'Pro', features: 'Deep reasoning, 5x usage, priority access' },
    gpt: { status: 'Max', features: 'Long context, vision capabilities, fastest response' },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white/80">Loading…</div>
      </div>
    );
  }

  if (!user || (user.email || '').toLowerCase() !== 'kashpm2002@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white/90">
          <div className="text-2xl font-bold mb-2">Unauthorized</div>
          <div className="text-white/70 mb-6">This dashboard is restricted to administrators.</div>
          <Link href="/" className="text-blue-300 hover:text-blue-200 underline">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-6">Admin Dashboard - Product Vision 2025</h1>
        {/* Quick Diagram Links (always visible at top) */}
        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            href="/docs/project-map"
            className="px-4 py-2 rounded-lg bg-indigo-600/70 hover:bg-indigo-600 text-white transition-colors"
          >
            📘 View Project Map (Mermaid)
          </Link>
          <Link
            href="/docs/data-flow"
            className="px-4 py-2 rounded-lg bg-teal-600/70 hover:bg-teal-600 text-white transition-colors"
          >
            🔄 View Data Flow (Mermaid)
          </Link>
        </div>
        
        {/* Premium Subscriptions Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {Object.entries(subscriptions).map(([service, details]) => (
            <div key={service} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white capitalize mb-2">{service}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                  {details.status}
                </span>
              </div>
              <p className="text-sm text-gray-300">{details.features}</p>
            </div>
          ))}
        </div>

        {/* Vision Documents */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">📚 Product Vision Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/PRODUCT_VISION_2025.md" target="_blank" 
              className="block p-4 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition-colors">
              <h3 className="text-lg font-semibold text-white">🚀 Product Vision 2025</h3>
              <p className="text-sm text-gray-300 mt-1">Complete vision leveraging premium stack</p>
            </Link>
            <Link href="/IMPLEMENTATION_PRIORITIES_2025.md" target="_blank"
              className="block p-4 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors">
              <h3 className="text-lg font-semibold text-white">🎯 Implementation Priorities</h3>
              <p className="text-sm text-gray-300 mt-1">30-day sprint plan and roadmap</p>
            </Link>
            <Link href="/VISION_SUMMARY_2025.md" target="_blank"
              className="block p-4 bg-green-600/20 rounded-lg hover:bg-green-600/30 transition-colors">
              <h3 className="text-lg font-semibold text-white">📋 Vision Summary</h3>
              <p className="text-sm text-gray-300 mt-1">Key updates and metrics</p>
            </Link>
            <Link href="/PRODUCT_VISION.md" target="_blank"
              className="block p-4 bg-orange-600/20 rounded-lg hover:bg-orange-600/30 transition-colors">
              <h3 className="text-lg font-semibold text-white">📜 Original Vision</h3>
              <p className="text-sm text-gray-300 mt-1">Previous product vision for reference</p>
            </Link>
          </div>
        </div>

        {/* Architecture Diagrams */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🗺️ Architecture Diagrams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/docs/project-map"
              className="block p-4 bg-indigo-600/20 rounded-lg hover:bg-indigo-600/30 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white">📘 Project Map (Mermaid)</h3>
              <p className="text-sm text-gray-300 mt-1">Repo structure and systems overview</p>
            </Link>
            <Link
              href="/docs/data-flow"
              className="block p-4 bg-teal-600/20 rounded-lg hover:bg-teal-600/30 transition-colors"
            >
              <h3 className="text-lg font-semibold text-white">🔄 Data Flow (Mermaid)</h3>
              <p className="text-sm text-gray-300 mt-1">Auth, league, draft, and pipelines</p>
            </Link>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🗄️ Database Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => fetch('/api/admin/dedupe/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dryRun: false, limit: 5000 }) }).then(r => r.json()).then(data => alert(JSON.stringify(data, null, 2)))}
              className="block p-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              <h3 className="font-semibold text-white">🧹 Remove Duplicates</h3>
              <p className="text-sm text-gray-200 mt-1">Clean Carson Beck dupes</p>
            </button>
            <button
              onClick={() => fetch('/api/admin/players/retire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ names: ['Quinn Ewers', 'Luther Burden III'], season: 2025 }) }).then(r => r.json()).then(data => alert(JSON.stringify(data, null, 2)))}
              className="block p-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              <h3 className="font-semibold text-white">📜 Retire NFL Players</h3>
              <p className="text-sm text-gray-200 mt-1">Quinn Ewers, Luther Burden III</p>
            </button>
          </div>
        </div>

        {/* League Management */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🏆 League Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => fetch('/api/admin/leagues/sync-members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ leagueId: '6894db4a0001ad84e4b0' }) }).then(r => r.json()).then(data => alert(JSON.stringify(data, null, 2)))}
              className="block p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              <h3 className="font-semibold text-white">🔄 Fix Jawn League</h3>
              <p className="text-sm text-gray-200 mt-1">Sync all 11 members' navigation access</p>
            </button>
            <button
              onClick={() => window.open('/api/debug/user-leagues', '_blank')}
              className="block p-4 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              <h3 className="font-semibold text-white">🔍 Debug User</h3>
              <p className="text-sm text-gray-200 mt-1">Check current user's league data</p>
            </button>
            <button
              onClick={() => {
                const leagueId = prompt('Enter League ID to process draft completion:');
                if (leagueId) {
                  fetch('/api/draft/complete', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ leagueId }) 
                  }).then(r => r.json()).then(data => alert(JSON.stringify(data, null, 2)));
                }
              }}
              className="block p-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              <h3 className="font-semibold text-white">🏁 Process Draft</h3>
              <p className="text-sm text-gray-200 mt-1">Save drafted players to rosters</p>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/sync-status" className="block p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity">
              <h3 className="font-semibold text-white">Sync Status</h3>
              <p className="text-sm text-gray-200 mt-1">Vercel-Appwrite Health</p>
            </Link>
            {/* Removed non-existent cache status and SEC survey per request */}
            <button 
              onClick={() => {
                const id = prompt('Enter League or Roster ID to delete for testing:');
                const type = prompt('Enter type (league or roster):');
                if (id && type) {
                  fetch('/api/debug/test-realtime', { 
                    method: 'DELETE', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ id, type }) 
                  }).then(r => r.json()).then(data => alert(JSON.stringify(data, null, 2)));
                }
              }}
              className="p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:opacity-90 transition-opacity"
            >
              <h3 className="font-semibold text-white">🧪 Test Real-time</h3>
              <p className="text-sm text-gray-200 mt-1">Delete league/roster for testing</p>
            </button>
            {/* Removed Launch Beta placeholder */}
          </div>
        </div>

        {/* Integration Status */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">🔥 Available Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>✅ Appwrite Realtime subscriptions</li>
              <li>✅ Vercel Edge Functions</li>
              <li>✅ AI Draft Assistant (Claude + GPT-4)</li>
              <li>✅ 3D Graphics (Spline Pro)</li>
              <li>✅ Video Generation (Runway AI)</li>
              <li>✅ Sports Data (Rotowire + CFBD)</li>
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">📅 This Week's Goals</h3>
            <ul className="space-y-2 text-gray-300">
              <li>🎯 Set up analytics tracking</li>
              <li>🎯 Integrate first AI feature</li>
              <li>🎯 Enable real-time updates</li>
              <li>🎯 Launch closed beta</li>
              <li>🎯 Get first 10 users</li>
              <li>🎯 Gather feedback</li>
            </ul>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="mt-12 text-center">
          <Link href="/docs" className="text-purple-400 hover:text-purple-300 mr-6">
            View All Documentation →
          </Link>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Back to App →
          </Link>
        </div>
      </div>
    </div>
  );
}