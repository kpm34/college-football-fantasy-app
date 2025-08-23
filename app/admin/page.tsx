'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import { useAuth } from '@lib/hooks/useAuth';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [showDiagram, setShowDiagram] = useState<null | { slug: string; title: string }>(null)
  const [charts, setCharts] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState({
    appwrite: { status: 'Pro', features: 'Unlimited functions, 100GB storage, priority support' },
    vercel: { status: 'Pro', features: 'Advanced analytics, unlimited functions, team collaboration' },
    claude: { status: 'Pro', features: 'Deep reasoning, 5x usage, priority access' },
    gpt: { status: 'Max', features: 'Long context, vision capabilities, fastest response' },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 flex items-center justify-center">
        <div className="text-amber-900 font-semibold">Loading…</div>
      </div>
    );
  }

  if (!user || (user.email || '').toLowerCase() !== 'kashpm2002@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 flex items-center justify-center">
        <div className="text-center text-amber-900">
          <div className="text-2xl font-bold mb-2">Unauthorized</div>
          <div className="text-amber-800 mb-6">This dashboard is restricted to administrators.</div>
          <Link href="/" className="text-sky-700 hover:text-sky-900 underline font-medium">Return Home</Link>
        </div>
      </div>
    );
  }

  const loadDiagram = async (slug: string, title: string) => {
    try {
      const res = await fetch(`/api/docs/mermaid/${slug}`, { cache: 'no-store' })
      const data = await res.json()
      setDebugInfo({ endpoint: slug, response: data, status: res.status })
      setShowDiagram({ slug, title })
      setCharts(data.charts || [])
      setLastUpdated(data.updatedAt || '')
    } catch (error: unknown) {
      console.error('Error loading diagram:', error)
      const message = (error as any)?.message || 'Unknown error'
      setDebugInfo({ endpoint: slug, error: message })
      setCharts([])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-amber-900 mb-8">Admin Dashboard - Product Vision 2025</h1>
        
        {/* Functional Architecture Diagrams */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-amber-900 mb-4">⚡ Functional Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => loadDiagram('functional-architecture:create-account', '👤 Create Account')}
              className="px-4 py-3 rounded-lg bg-sky-600 text-white transition-all hover:bg-sky-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">👤 Create Account</div>
              <div className="text-sm text-sky-100">User registration flow</div>
            </button>
            
            <button
              onClick={() => loadDiagram('functional-architecture:create-league', '🏆 Create League')}
              className="px-4 py-3 rounded-lg bg-rose-700 text-white transition-all hover:bg-rose-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">🏆 Create League</div>
              <div className="text-sm text-rose-100">League setup process</div>
            </button>

            <button
              onClick={() => loadDiagram('functional-architecture:join-league', '🤝 Join League')}
              className="px-4 py-3 rounded-lg bg-orange-600 text-white transition-all hover:bg-orange-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">🤝 Join League</div>
              <div className="text-sm text-orange-100">Join via invite or browse</div>
            </button>

            <button
              onClick={() => loadDiagram('functional-architecture:draft', '📋 Draft System')}
              className="px-4 py-3 rounded-lg bg-amber-700 text-white transition-all hover:bg-amber-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">📋 Draft System</div>
              <div className="text-sm text-amber-100">Snake & auction drafts</div>
            </button>
          </div>
        </div>



        {/* Project Map */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-amber-900 mb-4">🗺️ Project Map</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/admin/project-map"
              className="px-4 py-3 rounded-lg bg-gradient-to-r from-sky-600 to-sky-700 text-white transition-all hover:from-sky-700 hover:to-sky-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md block"
            >
              <div className="font-semibold">🗺️ Interactive Project Map</div>
              <div className="text-sm text-sky-100">Navigate repository structure</div>
            </Link>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mb-10 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200">
          <h3 className="text-xl font-bold text-amber-900 mb-4">💎 Premium Subscriptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(subscriptions).map(([service, details]) => (
              <div key={service} className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-amber-900 capitalize">{service}</span>
                  <span className="text-xs bg-gradient-to-r from-amber-600 to-orange-600 text-white px-2 py-1 rounded-full">{details.status}</span>
                </div>
                <p className="text-sm text-amber-800">{details.features}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Priorities */}
        <div className="mb-10 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200">
          <h3 className="text-xl font-bold text-amber-900 mb-4">🎯 Strategic Priorities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-lg border border-sky-300">
              <h4 className="font-semibold text-sky-900 mb-2">🤖 AI-First Platform</h4>
              <ul className="text-sm space-y-1 text-sky-800">
                <li>• Claude for strategy & analysis</li>
                <li>• GPT-4 for content generation</li>
                <li>• Custom models for projections</li>
                <li>• Automated insights & recommendations</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-lg border border-rose-300">
              <h4 className="font-semibold text-rose-900 mb-2">⚡ Real-Time Everything</h4>
              <ul className="text-sm space-y-1 text-rose-800">
                <li>• Live draft with &lt;100ms latency</li>
                <li>• Real-time scoring updates</li>
                <li>• Instant trade processing</li>
                <li>• Live projection adjustments</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-300">
              <h4 className="font-semibold text-orange-900 mb-2">💰 Premium Monetization</h4>
              <ul className="text-sm space-y-1 text-orange-800">
                <li>• $9.99/mo Pro tier</li>
                <li>• $19.99/mo Dynasty tier</li>
                <li>• Custom league features</li>
                <li>• White-label solutions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Diagram Display Modal */}
        {showDiagram && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto border-2 border-amber-300">
              <div className="sticky top-0 bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-4 border-b border-amber-300 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-amber-900">{showDiagram.title}</h2>
                <button
                  onClick={() => {
                    setShowDiagram(null)
                    setCharts([])
                    setDebugInfo(null)
                  }}
                  className="text-amber-700 hover:text-amber-900 text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                {charts.length > 0 ? (
                  <div className="space-y-6">
                    {charts.map((chart: string, idx: number) => (
                      <div key={idx} className="border border-amber-200 rounded-lg p-4 bg-amber-50/30">
                        <MermaidRenderer chart={chart} />
                      </div>
                    ))}
                    {lastUpdated && (
                      <p className="text-sm text-amber-700 mt-4">
                        Last updated: {lastUpdated}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-amber-800">
                    <p>No diagram found for: {showDiagram.slug}</p>
                    {debugInfo && (
                      <pre className="mt-4 p-4 bg-amber-100 rounded text-xs overflow-auto text-amber-900">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}