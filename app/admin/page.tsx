'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import { useAuth } from '@hooks/useAuth';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-6">Admin Dashboard - Product Vision 2025</h1>
        
        {/* Projections System Diagrams */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-4">📊 Projections System Diagrams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => loadDiagram('projections-overview', '📈 Projections Overview')}
              className="px-4 py-3 rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📈 Projections Overview</div>
              <div className="text-sm text-blue-100">System architecture & data flow</div>
            </button>
            
            <button
              onClick={() => loadDiagram('projections-algorithm', '🧮 Algorithm Flow')}
              className="px-4 py-3 rounded-lg bg-purple-600 text-white transition-colors hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🧮 Algorithm Flow</div>
              <div className="text-sm text-purple-100">Step-by-step projection logic</div>
            </button>

            <button
              onClick={() => loadDiagram('depth-multipliers', '📊 Depth Multipliers')}
              className="px-4 py-3 rounded-lg bg-green-600 text-white transition-colors hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📊 Depth Multipliers</div>
              <div className="text-sm text-green-100">Position-specific multipliers</div>
            </button>

            <button
              onClick={() => loadDiagram('data-sources', '📁 Data Sources')}
              className="px-4 py-3 rounded-lg bg-orange-600 text-white transition-colors hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📁 Data Sources</div>
              <div className="text-sm text-orange-100">File structure & organization</div>
            </button>

            <button
              onClick={() => loadDiagram('api-flow', '🔄 API Flow')}
              className="px-4 py-3 rounded-lg bg-pink-600 text-white transition-colors hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🔄 API Flow</div>
              <div className="text-sm text-pink-100">Draft API query sequence</div>
            </button>

            <button
              onClick={() => loadDiagram('troubleshooting', '🔧 Troubleshooting')}
              className="px-4 py-3 rounded-lg bg-red-600 text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🔧 Troubleshooting</div>
              <div className="text-sm text-red-100">Debug & fix common issues</div>
            </button>
          </div>
        </div>

        {/* System Architecture Diagrams */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-4">🏗️ System Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => loadDiagram('repository-structure', '📁 Repository Structure')}
              className="px-4 py-3 rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📁 Repository Structure</div>
              <div className="text-sm text-indigo-100">Project folders & organization</div>
            </button>

            <button
              onClick={() => loadDiagram('system-architecture', '🏛️ System Architecture')}
              className="px-4 py-3 rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🏛️ System Architecture</div>
              <div className="text-sm text-teal-100">Complete system overview</div>
            </button>

            <button
              onClick={() => loadDiagram('authentication-flow', '🔐 Authentication')}
              className="px-4 py-3 rounded-lg bg-cyan-600 text-white transition-colors hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🔐 Authentication</div>
              <div className="text-sm text-cyan-100">OAuth & session management</div>
            </button>
          </div>
        </div>

        {/* League & Draft Management */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-4">🏆 League & Draft Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => loadDiagram('league-management', '🏟️ League Management')}
              className="px-4 py-3 rounded-lg bg-purple-600 text-white transition-colors hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🏟️ League Management</div>
              <div className="text-sm text-purple-100">Create, join, manage leagues</div>
            </button>
            
            <button
              onClick={() => loadDiagram('draft-realtime', '📋 Draft Flow')}
              className="px-4 py-3 rounded-lg bg-pink-600 text-white transition-colors hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📋 Draft Flow</div>
              <div className="text-sm text-pink-100">Real-time draft system</div>
            </button>

            <button
              onClick={() => loadDiagram('search-filter-flow', '🔍 Search & Filter')}
              className="px-4 py-3 rounded-lg bg-yellow-600 text-white transition-colors hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🔍 Search & Filter</div>
              <div className="text-sm text-yellow-100">League search logic</div>
            </button>
          </div>
        </div>

        {/* Admin & Commissioner Tools */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-white mb-4">🛠️ Admin & Commissioner Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => loadDiagram('admin-operations', '🎮 Admin Operations')}
              className="px-4 py-3 rounded-lg bg-red-600 text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">🎮 Admin Operations</div>
              <div className="text-sm text-red-100">User & league management</div>
            </button>

            <button
              onClick={() => loadDiagram('commissioner-settings', '⚙️ Commissioner Settings')}
              className="px-4 py-3 rounded-lg bg-orange-600 text-white transition-colors hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">⚙️ Commissioner Settings</div>
              <div className="text-sm text-orange-100">Settings schema fix flow</div>
            </button>

            <button
              onClick={() => loadDiagram('data-flow', '📊 Complete Data Flow')}
              className="px-4 py-3 rounded-lg bg-emerald-600 text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-white/80 text-left"
            >
              <div className="font-semibold">📊 Complete Data Flow</div>
              <div className="text-sm text-emerald-100">All system data flows</div>
            </button>
          </div>
        </div>
        
        {/* Debug Info Controls */}
        <div className="mb-10 flex flex-wrap gap-3">
          {debugInfo && (
            <>
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
              <button
                onClick={() => setDebugInfo(null)}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white transition-colors hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80"
              >
                ❌ Clear Debug Info
              </button>
            </>
          )}
        </div>
        
        {/* Debug Info Display */}
        {debugInfo && (
          <div className="mb-8 bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30">
            <h3 className="text-lg font-bold text-yellow-400 mb-3">🐛 Mermaid API Debug Info</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div><strong>Endpoint:</strong> /api/docs/mermaid/{debugInfo.endpoint}</div>
              <div><strong>Status:</strong> {debugInfo.status || 'N/A'}</div>
              <div><strong>Charts Found:</strong> {debugInfo.response?.charts?.length || 0}</div>
              <div><strong>Error:</strong> {debugInfo.response?.error || debugInfo.error || 'None'}</div>
              <div><strong>Source:</strong> {debugInfo.response?.source || 'N/A'}</div>
              <div><strong>File Name:</strong> {debugInfo.response?.fileName || 'N/A'}</div>
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

      {/* Diagram Modal - Full Screen with Better Contrast */}
      {showDiagram && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white flex flex-col">
            {/* Header with strong contrast */}
            <div className="flex items-center justify-between px-8 py-4 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-white/20">
              <div>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{showDiagram.title}</h3>
                {lastUpdated && <p className="text-sm text-blue-200 mt-1">Last updated: {new Date(lastUpdated).toLocaleString()}</p>}
              </div>
              <button 
                onClick={() => {
                  setShowDiagram(null)
                  setCharts([])
                }} 
                className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg" 
                aria-label="Close diagram"
              >
                ✕ Close
              </button>
            </div>
            
            {/* Content area - full height with better background */}
            <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-900 to-black p-8">
              {charts.length === 0 && (
                <div className="text-yellow-300 mb-6 p-6 bg-yellow-900/30 border border-yellow-500/50 rounded-lg backdrop-blur-sm">
                  <div className="font-bold text-lg mb-3">⚠️ No charts loaded</div>
                  {debugInfo && (
                    <div className="text-sm space-y-2 text-yellow-200">
                      <div><span className="font-semibold">API Status:</span> {debugInfo.status || 'Unknown'}</div>
                      <div><span className="font-semibold">Error:</span> {debugInfo.response?.error || debugInfo.error || 'Unknown'}</div>
                      <div><span className="font-semibold">File:</span> {debugInfo.response?.fileName || 'Not found'}</div>
                    </div>
                  )}
                </div>
              )}
              {charts.length > 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full max-w-[90vw] bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                    <style jsx global>{`
                      .mermaid {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 60vh;
                      }
                      .mermaid svg {
                        max-width: 100% !important;
                        height: auto !important;
                        min-height: 420px !important;
                      }
                      /* Enhance Mermaid diagram text visibility */
                      .mermaid .nodeLabel {
                        color: #1a1a1a !important;
                        font-weight: 600 !important;
                        font-size: 13px !important;
                      }
                      .mermaid .edgeLabel {
                        background-color: white !important;
                        color: #1a1a1a !important;
                        font-weight: 500 !important;
                      }
                      .mermaid rect {
                        stroke-width: 2px !important;
                      }
                      .mermaid .node rect,
                      .mermaid .node circle,
                      .mermaid .node ellipse,
                      .mermaid .node polygon,
                      .mermaid .node path {
                        fill: #e0e7ff !important;
                        stroke: #4338ca !important;
                      }
                      .mermaid .node.default rect,
                      .mermaid .node.default circle,
                      .mermaid .node.default ellipse,
                      .mermaid .node.default polygon {
                        fill: #f3f4f6 !important;
                        stroke: #6b7280 !important;
                      }
                      /* Subgraph styling */
                      .mermaid .cluster rect {
                        fill: #fef3c7 !important;
                        stroke: #f59e0b !important;
                        stroke-width: 2px !important;
                      }
                      .mermaid .cluster text {
                        fill: #92400e !important;
                        font-weight: bold !important;
                      }
                      /* Arrow styling */
                      .mermaid .arrowheadPath {
                        fill: #4338ca !important;
                      }
                      .mermaid .edgePath .path {
                        stroke: #4338ca !important;
                        stroke-width: 2px !important;
                      }
                      /* Sequence diagram specific */
                      .mermaid .actor {
                        fill: #ddd6fe !important;
                        stroke: #7c3aed !important;
                      }
                      .mermaid .actor-line {
                        stroke: #7c3aed !important;
                      }
                      .mermaid .messageLine0 {
                        stroke: #4338ca !important;
                      }
                      .mermaid .messageLine1 {
                        stroke: #4338ca !important;
                        stroke-dasharray: 2, 2 !important;
                      }
                      /* Dark mode override for better contrast */
                      .dark .mermaid {
                        filter: none !important;
                      }
                    `}</style>
                    <div className="[&_svg]:!max-w-full [&_svg]:!min-h-[600px] [&_svg]:h-auto [&_svg]:mx-auto">
                      <MermaidRenderer charts={charts} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-300 text-center p-12 bg-gray-800/50 rounded-xl backdrop-blur-sm">
                    <div className="text-xl mb-2">📊 No diagrams found</div>
                    <div className="text-sm text-gray-400">Check the debug info above for details</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}