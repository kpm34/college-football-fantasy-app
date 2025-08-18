'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MermaidRenderer } from '@/components/docs/MermaidRenderer'
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [showDiagram, setShowDiagram] = useState<null | { slug: 'data-flow' | 'project-map'; title: string }>(null)
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

  // Unify: always load via API route for consistent behavior

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-6">Admin Dashboard - Product Vision 2025</h1>
        {/* Quick Diagram Links (always visible at top) */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-4">📊 Project Architecture Diagrams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={async () => {
                const res = await fetch('/api/docs/mermaid/project-map', { cache: 'no-store' })
                const data = await res.json()
                setDebugInfo({ endpoint: 'project-map-repo', response: data, status: res.status })
                setShowDiagram({ slug: 'project-map', title: '📁 Repository Structure' })
                setCharts(data.charts?.slice(0, 1) || [])
                setLastUpdated(data.updatedAt || '')
              }}
              className="px-4 py-3 rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📁 Repository Structure</div>
              <div className="text-sm text-blue-100">Project folders & organization</div>
            </button>
            
            <button
              onClick={async () => {
                const res = await fetch('/api/docs/mermaid/project-map', { cache: 'no-store' })
                const data = await res.json()
                setDebugInfo({ endpoint: 'project-map-dataflow', response: data, status: res.status })
                setShowDiagram({ slug: 'project-map', title: '🔄 Functionality & Data Flow' })
                setCharts(data.charts?.slice(1, 2) || [])
                setLastUpdated(data.updatedAt || '')
              }}
              className="px-4 py-3 rounded-lg bg-purple-600 text-white transition-colors hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🔄 Data Flow Architecture</div>
              <div className="text-sm text-purple-100">APIs, database & real-time updates</div>
            </button>

            <button
              onClick={async () => {
                const res = await fetch('/api/docs/mermaid/project-map', { cache: 'no-store' })
                const data = await res.json()
                setDebugInfo({ endpoint: 'project-map-schema', response: data, status: res.status })
                setShowDiagram({ slug: 'project-map', title: '🔧 Commissioner Schema Fix' })
                setCharts(data.charts?.slice(2, 3) || [])
                setLastUpdated(data.updatedAt || '')
              }}
              className="px-4 py-3 rounded-lg bg-green-600 text-white transition-colors hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🔧 Schema Fix Flow</div>
              <div className="text-sm text-green-100">Commissioner settings alignment</div>
            </button>

            <button
              onClick={async () => {
                const res = await fetch('/api/docs/mermaid/project-map', { cache: 'no-store' })
                const data = await res.json()
                setDebugInfo({ endpoint: 'project-map-admin', response: data, status: res.status })
                setShowDiagram({ slug: 'project-map', title: '🎮 Admin Operations Flow' })
                setCharts(data.charts?.slice(3, 4) || [])
                setLastUpdated(data.updatedAt || '')
              }}
              className="px-4 py-3 rounded-lg bg-orange-600 text-white transition-colors hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🎮 Admin Operations</div>
              <div className="text-sm text-orange-100">User & league management flows</div>
            </button>

            <button
              onClick={async () => {
                setShowDiagram({ slug: 'data-flow', title: '📊 Complete Data Flow' })
                const res = await fetch('/api/docs/mermaid/data-flow', { cache: 'no-store' })
                const data = await res.json()
                setDebugInfo({ endpoint: 'data-flow', response: data, status: res.status })
                setCharts(data.charts || [])
                setLastUpdated(data.updatedAt || '')
              }}
              className="px-4 py-3 rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📊 Complete Data Flow</div>
              <div className="text-sm text-teal-100">All system flows & pipelines</div>
            </button>

            <button
              onClick={async () => {
                const res = await fetch('/api/docs/mermaid/project-map', { cache: 'no-store' })
                const data = await res.json()
                setDebugInfo({ endpoint: 'project-map-all', response: data, status: res.status })
                setShowDiagram({ slug: 'project-map', title: '🗺️ Complete Project Map' })
                setCharts(data.charts || [])
                setLastUpdated(data.updatedAt || '')
              }}
              className="px-4 py-3 rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🗺️ View All Project Maps</div>
              <div className="text-sm text-indigo-100">All 4 diagrams together</div>
            </button>
          </div>
        </div>
        
        <div className="mb-10 flex flex-wrap gap-3">
          {debugInfo && (
            <button
              onClick={() => {
                const debugText = JSON.stringify(debugInfo, null, 2);
                navigator.clipboard.writeText(debugText);
                alert('Debug info copied to clipboard!');
              }}
              className="px-4 py-2 rounded-lg bg-yellow-600 text-white transition-colors hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-white/80"
            >
              📋 Copy Debug Info
            </button>
          )}
        </div>
        
        {/* Debug Info Display */}
        {debugInfo && (
          <div className="mb-8 bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">🐛 Mermaid API Debug Info</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div><strong>Endpoint:</strong> /api/docs/mermaid/{debugInfo.endpoint}</div>
              <div><strong>Status:</strong> {debugInfo.status}</div>
              <div><strong>Charts Found:</strong> {debugInfo.response?.charts?.length || 0}</div>
              <div><strong>Error:</strong> {debugInfo.response?.error || 'None'}</div>
              <div><strong>Source:</strong> {debugInfo.response?.source || 'N/A'}</div>
              <div><strong>Tried:</strong> {Array.isArray(debugInfo.response?.tried) ? debugInfo.response.tried.join(', ') : 'N/A'}</div>
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer text-yellow-400 hover:text-yellow-300">View Full Response</summary>
              <pre className="mt-2 p-3 bg-gray-800 rounded text-xs text-gray-300 overflow-auto max-h-64">
                {JSON.stringify(debugInfo.response, null, 2)}
              </pre>
            </details>
          </div>
        )}
        
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

      {showDiagram && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
          <div className="w-full max-w-7xl bg-gray-900 text-white rounded-xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700">
              <div>
                <h3 className="text-xl font-semibold">{showDiagram.title} (Mermaid)</h3>
                {lastUpdated && <p className="text-xs text-gray-300">Last updated: {new Date(lastUpdated).toLocaleString()}</p>}
              </div>
              <button onClick={() => setShowDiagram(null)} className="px-3 py-1.5 rounded-md bg-white text-gray-900 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/80" aria-label="Close diagram">Close</button>
            </div>
            <div className="max-h-[80vh] overflow-auto p-6 bg-gray-950">
              {/* Debug: Show chart count and API response */}
              {charts.length === 0 && (
                <div className="text-yellow-400 mb-4 p-4 bg-gray-800 rounded">
                  <div className="font-bold mb-2">⚠️ No charts loaded</div>
                  {debugInfo && (
                    <div className="text-sm space-y-1">
                      <div>API Status: {debugInfo.status}</div>
                      <div>Error: {debugInfo.response?.error || 'Unknown'}</div>
                      <div>Source tried: {debugInfo.response?.source || debugInfo.response?.tried?.join(', ') || 'None'}</div>
                      <div>Charts returned: {debugInfo.response?.charts?.length || 0}</div>
                    </div>
                  )}
                </div>
              )}
              {charts.length > 0 ? (
                <div className="space-y-8">
                  {showDiagram.title.includes('Repository Structure') ? (
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-2">📁 Repository Structure</h4>
                      <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[600px] [&_svg]:h-auto [&_svg]:mx-auto [&_svg]:scale-125">
                        {charts[0] ? <MermaidRenderer charts={[charts[0]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                      </div>
                    </div>
                  ) : showDiagram.title.includes('Data Flow Architecture') ? (
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-2">🔄 Functionality & Data Flow</h4>
                      <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[700px] [&_svg]:h-auto [&_svg]:mx-auto">
                        {charts[0] ? <MermaidRenderer charts={[charts[0]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                      </div>
                    </div>
                  ) : showDiagram.title.includes('Schema Fix') ? (
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-2">🔧 Commissioner Settings Schema Fix Flow</h4>
                      <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[500px] [&_svg]:h-auto [&_svg]:mx-auto">
                        {charts[0] ? <MermaidRenderer charts={[charts[0]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                      </div>
                    </div>
                  ) : showDiagram.title.includes('Admin Operations') ? (
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-white mb-6 border-b border-white/20 pb-2">🎮 Complete Admin Operations Flow</h4>
                      <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[500px] [&_svg]:h-auto [&_svg]:mx-auto">
                        {charts[0] ? <MermaidRenderer charts={[charts[0]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                      </div>
                    </div>
                  ) : showDiagram.title.includes('Complete Project Map') ? (
                    <>
                      <div className="mb-8">
                        <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">📁 Repository Structure</h4>
                        <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[400px] [&_svg]:h-auto [&_svg]:mx-auto">
                          {charts[0] ? <MermaidRenderer charts={[charts[0]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                        </div>
                      </div>
                      {charts.length > 1 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">🔄 Functionality & Data Flow</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[500px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[1] ? <MermaidRenderer charts={[charts[1]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                      {charts.length > 2 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">🔧 Commissioner Settings Schema Fix Flow</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[400px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[2] ? <MermaidRenderer charts={[charts[2]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                      {charts.length > 3 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">🎮 Complete Admin Operations Flow</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[400px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[3] ? <MermaidRenderer charts={[charts[3]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                    </>
                  ) : showDiagram.title.includes('Complete Data Flow') ? (
                    <>
                      <div className="mb-8">
                        <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">🔐 Authentication Flow</h4>
                        <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[300px] [&_svg]:h-auto [&_svg]:mx-auto">
                          {charts[0] ? <MermaidRenderer charts={[charts[0]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                        </div>
                      </div>
                      {charts.length > 1 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">🏟️ League Management Flow</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[300px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[1] ? <MermaidRenderer charts={[charts[1]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                      {charts.length > 2 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">📋 Draft Flow (Real-time)</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[300px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[2] ? <MermaidRenderer charts={[charts[2]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                      {charts.length > 3 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">📊 Player Data Pipeline</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[300px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[3] ? <MermaidRenderer charts={[charts[3]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                      {charts.length > 4 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">🎯 Projections System</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[400px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[4] ? <MermaidRenderer charts={[charts[4]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                      {charts.length > 5 && (
                        <div className="mb-8">
                          <h4 className="text-xl font-bold text-white mb-4 border-b border-white/20 pb-2">🔍 Search & Filter Flow</h4>
                          <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[300px] [&_svg]:h-auto [&_svg]:mx-auto">
                            {charts[5] ? <MermaidRenderer charts={[charts[5]]} /> : <div className="text-gray-400">Loading diagram...</div>}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="[&_svg]:!max-w-full [&_svg]:h-auto [&_svg]:mx-auto">
                      <MermaidRenderer charts={charts} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-200">No diagrams found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}