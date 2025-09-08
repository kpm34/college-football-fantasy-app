'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import { useAuth } from '@lib/hooks/useAuth'
import Link from 'next/link'
import { useState } from 'react'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [showDiagram, setShowDiagram] = useState<null | { slug: string; title: string }>(null)
  const [charts, setCharts] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState({
    appwrite: { status: 'Pro', features: 'Unlimited functions, 100GB storage, priority support' },
    vercel: {
      status: 'Pro',
      features: 'Advanced analytics, unlimited functions, team collaboration',
    },
    claude: { status: 'Pro', features: 'Deep reasoning, 5x usage, priority access' },
    gpt: { status: 'Max', features: 'Long context, vision capabilities, fastest response' },
  })
  // Admin tools state
  const [season, setSeason] = useState<number>(new Date().getFullYear())
  const [applyChanges, setApplyChanges] = useState<boolean>(false)
  const [leagueIdInput, setLeagueIdInput] = useState<string>('')
  const [running, setRunning] = useState<boolean>(false)
  const [actionResult, setActionResult] = useState<any>(null)

  // Bridge: handle open events from hub pages
  if (typeof window !== 'undefined') {
    window.removeEventListener('admin-open-diagram', (window as any)._openDiagramHandler as any)
    ;(window as any)._openDiagramHandler = (e: any) => {
      const d = e?.detail || {}
      if (d.open) loadDiagram(String(d.open), String(d.title || 'Diagram'))
    }
    window.addEventListener('admin-open-diagram', (window as any)._openDiagramHandler as any, { once: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 flex items-center justify-center">
        <div className="text-amber-900 font-semibold">Loading…</div>
      </div>
    )
  }

  if (!user || (user.email || '').toLowerCase() !== 'kashpm2002@gmail.com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 flex items-center justify-center">
        <div className="text-center text-amber-900">
          <div className="text-2xl font-bold mb-2">Unauthorized</div>
          <div className="text-amber-800 mb-6">This dashboard is restricted to administrators.</div>
          <Link href="/" className="text-sky-700 hover:text-sky-900 underline font-medium">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  const loadDiagram = async (slug: string, title: string) => {
    try {
      const encoded = encodeURIComponent(slug).replace(/%3A/g, ':')
      const res = await fetch(`/api/docs/mermaid/${encoded}`, { cache: 'no-store' })
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

  // Helpers for Admin Tools actions (server-verified on API routes)
  const postJSON = async (url: string, body?: any) => {
    try {
      setRunning(true)
      setActionResult(null)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json().catch(() => ({}))
      setActionResult({ url, status: res.status, data })
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      return data
    } catch (e: any) {
      setActionResult((prev: any) => ({ ...(prev || {}), error: e?.message || 'Failed' }))
      return null
    } finally {
      setRunning(false)
    }
  }

  const refreshPlayers = () => postJSON('/api/admin/players/refresh', { season })
  const reconcileDepth = () =>
    postJSON('/api/admin/players/reconcile-depth', { season, apply: applyChanges })
  const cronCleanup = () =>
    postJSON('/api/admin/players/cron-cleanup', { season, apply: applyChanges })
  const dedupePlayers = () =>
    postJSON('/api/admin/dedupe/players', { dryRun: !applyChanges, limit: 1000, offset: 0 })
  const syncLeagueMembers = () => {
    if (!leagueIdInput.trim()) {
      setActionResult({ error: 'League ID required' })
      return
    }
    return postJSON('/api/admin/leagues/sync-members', { leagueId: leagueIdInput.trim() })
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #FAEEE1 0%, #FFF8ED 40%, #F2E5D5 100%)' }}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <h1 className="text-4xl font-extrabold" style={{ color: '#5B2E0F' }}>
          Admin Dashboard
        </h1>
        <p className="mt-1 mb-8" style={{ color: '#7A4A24' }}>
          Quick access to maps, flows, and architecture
        </p>

        {/* Open diagram via query param from hub pages */}
        {typeof window !== 'undefined' && !showDiagram ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
              (function(){
                try {
                  var url = new URL(window.location.href);
                  var open = url.searchParams.get('open');
                  var title = url.searchParams.get('title') || 'Diagram';
                  if (open) {
                    window.dispatchEvent(new CustomEvent('admin-open-diagram', { detail: { open: open, title: title } }));
                    url.searchParams.delete('open'); url.searchParams.delete('title');
                    window.history.replaceState({}, '', url.toString());
                  }
                } catch {}
              })();
            `,
            }}
          />
        ) : null}

        {/* Diagrams — Domain Hubs */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-3" style={{ color: '#5B2E0F' }}>
            🧭 Diagrams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <Link href="/admin/diagrams/project-map" className="px-4 py-4 rounded-xl shadow-md text-left block transition-all" style={{ background: '#2B6CB0', color: '#fff' }}>
              <div className="font-semibold">🗺️ Project Map</div>
              <div className="text-sm text-sky-100">Overview · User Flow · Entity Relation · API/Events</div>
            </Link>
            <Link href="/admin/diagrams/system-architecture" className="px-4 py-4 rounded-xl shadow-md text-left block transition-all" style={{ background: '#1D4ED8', color: '#fff' }}>
              <div className="font-semibold">🏗️ System Architecture</div>
              <div className="text-sm text-indigo-100">Projections · Weight Tuning · Data Flow</div>
            </Link>
            <Link href="/admin/diagrams/functional-flow" className="px-4 py-4 rounded-xl shadow-md text-left block transition-all" style={{ background: '#DC2626', color: '#fff' }}>
              <div className="font-semibold">⚡ Functional Flow</div>
              <div className="text-sm text-rose-100">Create/Join League · Auth · Draft</div>
            </Link>
            <Link href="/admin/diagrams/draft" className="px-4 py-4 rounded-xl shadow-md text-left block transition-all" style={{ background: '#B45309', color: '#fff' }}>
              <div className="font-semibold">🏈 Draft</div>
              <div className="text-sm text-amber-100">User Flow · Entity Relation · API Routing</div>
            </Link>
          </div>
        </div>

        {/* Functional Flow Section */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-3" style={{ color: '#5B2E0F' }}>
            ⚡ Functional Flow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <button
              onClick={() => loadDiagram('functional-flow:create-account', '👤 Create Account')}
              className="px-4 py-4 rounded-xl shadow-md text-left transition-all"
              style={{ background: '#2563EB', color: '#fff' }}
            >
              <div className="font-semibold">👤 Create Account</div>
              <div className="text-sm text-sky-100">User registration flow</div>
            </button>

            <button
              onClick={() => loadDiagram('functional-flow:create-league', '🏆 Create League')}
              className="px-4 py-4 rounded-xl shadow-md text-left transition-all"
              style={{ background: '#DC2626', color: '#fff' }}
            >
              <div className="font-semibold">🏆 Create League</div>
              <div className="text-sm text-rose-100">League setup & scheduling</div>
            </button>

            <button
              onClick={() => loadDiagram('functional-flow:join-league', '🤝 Join League')}
              className="px-4 py-4 rounded-xl shadow-md text-left transition-all"
              style={{ background: '#EA580C', color: '#fff' }}
            >
              <div className="font-semibold">🤝 Join League</div>
              <div className="text-sm text-orange-100">Join via invite or browse</div>
            </button>

            <button
              onClick={() => loadDiagram('project-map:overview', '🗺️ Project Map Overview')}
              className="px-4 py-4 rounded-xl shadow-md text-left transition-all"
              style={{ background: '#B45309', color: '#fff' }}
            >
              <div className="font-semibold">Project Map Overview</div>
              <div className="text-sm text-amber-100">New canonical diagram set</div>
            </button>
          </div>
        </div>

        {/* System Architecture Section */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-3" style={{ color: '#5B2E0F' }}>
            🏗️ System Architecture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <button
              onClick={() =>
                loadDiagram('system-architecture:projections-overview', '📊 Projections Overview')
              }
              className="px-4 py-3 rounded-lg bg-sky-700 text-white transition-all hover:bg-sky-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">📊 Projections Overview</div>
              <div className="text-sm text-sky-100">Complete pipeline architecture</div>
            </button>

            <a
              href="/admin/diagrams?file=projections.drawio"
              className="px-4 py-4 rounded-xl shadow-md text-left transition-all"
              style={{ background: '#1D4ED8', color: '#fff' }}
            >
              <div className="font-semibold">📈 Projections (draw.io)</div>
              <div className="text-sm text-indigo-100">Feature → weights → outputs</div>
            </a>

            <button
              onClick={() =>
                loadDiagram('system-architecture:yearly-projections', '📈 Yearly Projections')
              }
              className="px-4 py-3 rounded-lg bg-rose-600 text-white transition-all hover:bg-rose-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">📈 Yearly Projections</div>
              <div className="text-sm text-rose-100">Draft season projections</div>
            </button>

            <button
              onClick={() =>
                loadDiagram('system-architecture:weekly-projections', '📅 Weekly Projections')
              }
              className="px-4 py-3 rounded-lg bg-orange-700 text-white transition-all hover:bg-orange-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">📅 Weekly Projections</div>
              <div className="text-sm text-orange-100">In-season with weather & injuries</div>
            </button>

            <button
              onClick={() => loadDiagram('system-architecture:weight-tuning', '⚖️ Weight Tuning')}
              className="px-4 py-3 rounded-lg bg-amber-600 text-white transition-all hover:bg-amber-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-left shadow-md"
            >
              <div className="font-semibold">⚖️ Weight Tuning</div>
              <div className="text-sm text-amber-100">ML optimization loop</div>
            </button>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mb-10 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200">
          <h3 className="text-xl font-bold text-amber-900 mb-4">🛠️ Admin Tools</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-amber-900 w-24">Season</label>
                  <input
                    type="number"
                    value={season}
                    onChange={e => setSeason(Number(e.target.value || season))}
                    className="w-28 rounded border border-amber-300 px-2 py-1 bg-white/70 text-amber-900"
                  />
                </div>
                <label className="inline-flex items-center gap-2 text-sm text-amber-900">
                  <input
                    type="checkbox"
                    checked={applyChanges}
                    onChange={e => setApplyChanges(e.target.checked)}
                  />
                  Apply changes (otherwise dry run)
                </label>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-amber-900 w-24">League ID</label>
                  <input
                    type="text"
                    value={leagueIdInput}
                    onChange={e => setLeagueIdInput(e.target.value)}
                    placeholder="leagues/$id"
                    className="flex-1 rounded border border-amber-300 px-2 py-1 bg-white/70 text-amber-900"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-lg border border-sky-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={refreshPlayers}
                  disabled={running}
                  className="px-3 py-2 rounded bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-50"
                >
                  Refresh Players (CFBD)
                </button>
                <button
                  onClick={reconcileDepth}
                  disabled={running}
                  className="px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  Reconcile Depth
                </button>
                <button
                  onClick={cronCleanup}
                  disabled={running}
                  className="px-3 py-2 rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Cron Cleanup
                </button>
                <button
                  onClick={dedupePlayers}
                  disabled={running}
                  className="px-3 py-2 rounded bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Dedupe Players
                </button>
                <button
                  onClick={syncLeagueMembers}
                  disabled={running}
                  className="px-3 py-2 rounded bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  Sync League Members
                </button>
                <a
                  href={`/api/admin/players/export?season=${season}&format=csv`}
                  target="_blank"
                  className="px-3 py-2 rounded bg-indigo-700 text-white text-center hover:bg-indigo-800"
                >
                  Export Players CSV
                </a>
                <a
                  href={`/api/admin/players/export?season=${season}&format=json`}
                  target="_blank"
                  className="px-3 py-2 rounded bg-indigo-500 text-white text-center hover:bg-indigo-600"
                >
                  Export Players JSON
                </a>
                <a
                  href="/admin/cache-status"
                  className="px-3 py-2 rounded bg-blue-600 text-white text-center hover:bg-blue-700"
                >
                  Cache Status
                </a>
                <a
                  href="/admin/sync-status"
                  className="px-3 py-2 rounded bg-blue-500 text-white text-center hover:bg-blue-600"
                >
                  Sync Status
                </a>
                <a
                  href="/admin/sec-survey"
                  className="px-3 py-2 rounded bg-red-600 text-white text-center hover:bg-red-700"
                >
                  SEC → NFL Survey
                </a>
              </div>
            </div>

            {/* Result */}
            <div className="bg-white p-4 rounded-lg border border-amber-300">
              <h4 className="font-semibold text-amber-900 mb-2">Result</h4>
              {!actionResult ? (
                <p className="text-sm text-amber-700">No action run yet.</p>
              ) : (
                <pre className="text-xs bg-amber-50 text-amber-900 p-3 rounded overflow-auto max-h-64">
                  {JSON.stringify(actionResult, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Diagram Display Modal */}
        {showDiagram && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 z-50">
            <div className="bg-white rounded-none shadow-2xl w-screen h-screen overflow-hidden border-2 border-amber-300">
              <div className="sticky top-0 bg-gradient-to-r from-amber-100 to-orange-100 px-4 md:px-6 py-4 border-b border-amber-300 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-amber-900">{showDiagram.title}</h2>
                <div className="flex items-center gap-3">
                  <a
                    href={`/admin/diagrams/${encodeURIComponent(showDiagram.slug)}`}
                    target="_blank"
                    className="text-sky-700 hover:text-sky-900 underline text-sm"
                  >
                    Open as page
                  </a>
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
              </div>
              <div className="px-2 md:px-4 py-2 md:py-4 h-[calc(100vh-72px)] overflow-auto">
                {charts.length > 0 ? (
                  <div className="space-y-4 md:space-y-6">
                    {charts.map((chart: string, idx: number) => (
                      <div key={idx} className="p-0 bg-transparent">
                        <MermaidRenderer chart={chart} mode="modal" wheelZoom={true} />
                      </div>
                    ))}
                    {lastUpdated && (
                      <p className="text-sm text-amber-700 mt-4">Last updated: {lastUpdated}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-amber-800">
                    <p>No diagram found for: {showDiagram.slug}</p>
                    {debugInfo && (
                      <pre className="mt-4 p-4 bg-amber-100 rounded text-xs overflow-auto">
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
  )
}
