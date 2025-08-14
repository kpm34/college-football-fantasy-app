'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [subscriptions, setSubscriptions] = useState({
    appwrite: { status: 'Pro', features: 'Unlimited functions, 100GB storage, priority support' },
    vercel: { status: 'Pro', features: 'Advanced analytics, unlimited functions, team collaboration' },
    claude: { status: 'Pro', features: 'Deep reasoning, 5x usage, priority access' },
    gpt: { status: 'Max', features: 'Long context, vision capabilities, fastest response' },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Admin Dashboard - Product Vision 2025</h1>
        
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

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/sync-status" className="block p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity">
              <h3 className="font-semibold text-white">Sync Status</h3>
              <p className="text-sm text-gray-200 mt-1">Vercel-Appwrite Health</p>
            </Link>
            <Link href="/admin/cache-status" className="block p-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:opacity-90 transition-opacity">
              <h3 className="font-semibold text-white">Cache Status</h3>
              <p className="text-sm text-gray-200 mt-1">Vercel KV Statistics</p>
            </Link>
            <button className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90 transition-opacity">
              <h3 className="font-semibold text-white">Launch Beta</h3>
              <p className="text-sm text-gray-200 mt-1">Open to first 100 users</p>
            </button>
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