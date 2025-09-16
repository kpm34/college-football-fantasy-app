'use client'

import { Animated } from '@components/dev/Animated'
import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import {
  BoltIcon,
  MapIcon,
  MapPinIcon,
  Squares2X2Icon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@lib/hooks/useAuth'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const [showDiagram, setShowDiagram] = useState<null | { slug: string; title: string }>(null)
  const [charts, setCharts] = useState<string[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loadingDiagram, setLoadingDiagram] = useState<boolean>(false)
  const [slugInput, setSlugInput] = useState<string>('')
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

  // Dev-only admin bypass: allow access when in dev and token/email match
  const devBypass = (() => {
    if (typeof window === 'undefined') return false
    if (process.env.NODE_ENV === 'production') return false
    const envToken = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || ''
    const envEmail = (process.env.NEXT_PUBLIC_ADMIN_DEV_EMAIL || '').toLowerCase()
    // Support setting token via query param: ?devAdmin=TOKEN
    try {
      const url = new URL(window.location.href)
      const qp = url.searchParams.get('devAdmin')
      if (qp) {
        window.localStorage.setItem('admin-dev-token', qp)
        url.searchParams.delete('devAdmin')
        window.history.replaceState({}, '', url.toString())
      }
    } catch {}
    const lsToken = window.localStorage.getItem('admin-dev-token') || ''
    const userEmail = (user?.email || '').toLowerCase()
    if (envToken && lsToken && envToken === lsToken) return true
    if (envEmail && userEmail === envEmail) return true
    return false
  })()

  // Bridge: handle open events from hub pages
  if (typeof window !== 'undefined') {
    window.removeEventListener('admin-open-diagram', (window as any)._openDiagramHandler as any)
    ;(window as any)._openDiagramHandler = (e: any) => {
      const d = e?.detail || {}
      if (d.open) loadDiagram(String(d.open), String(d.title || 'Diagram'))
    }
    window.addEventListener('admin-open-diagram', (window as any)._openDiagramHandler as any)
  }

  // Also support query param ?open=... reliably on mount
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const open = url.searchParams.get('open')
      const title = url.searchParams.get('title') || 'Diagram'
      if (open) {
        window.dispatchEvent(new CustomEvent('admin-open-diagram', { detail: { open, title } }))
        url.searchParams.delete('open')
        url.searchParams.delete('title')
        window.history.replaceState({}, '', url.toString())
      }
    } catch {}
  }, [])

  if (loading && !devBypass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 flex items-center justify-center">
        <div className="text-amber-900 font-semibold">Loading…</div>
      </div>
    )
  }

  const hardcodedAdmin = (user?.email || '').toLowerCase() === 'kashpm2002@gmail.com'

  if (!hardcodedAdmin && !devBypass) {
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
      setLoadingDiagram(true)
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
    } finally {
      setLoadingDiagram(false)
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
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-orange-600 to-emerald-600 text-3d">
            Admin Dashboard
          </h1>
          <div className="hidden md:flex items-center gap-2 text-xs text-amber-800/80">
            <span className="px-2 py-1 rounded-full bg-white/70 border border-amber-300">
              Realtime
            </span>
            <span className="px-2 py-1 rounded-full bg-white/70 border border-amber-300">
              Mermaid
            </span>
            <span className="px-2 py-1 rounded-full bg-white/70 border border-amber-300">
              Lucid
            </span>
            <Link
              href="/admin/resources"
              className="px-2 py-1 rounded-full bg-emerald-700 text-white border border-emerald-800 hover:bg-emerald-800"
            >
              Resources
            </Link>
          </div>
        </div>
        <p className="mt-1 mb-8 text-amber-900/80">Quick access to maps, flows, and architecture</p>

        {/* Query param handled in useEffect */}

        {/* Quick Open (slug) */}
        <div className="mb-6 rounded-xl border border-amber-200 bg-white/95 shadow p-3 md:p-4">
          <form
            className="flex items-center gap-2"
            onSubmit={e => {
              e.preventDefault()
              const s = slugInput.trim()
              if (s) loadDiagram(s, s)
            }}
          >
            <input
              value={slugInput}
              onChange={e => setSlugInput(e.target.value)}
              placeholder="Open by slug (e.g., project-map:api-and-events:auth-apis-and-events)"
              className="flex-1 rounded-xl border border-amber-300 bg-white px-3 py-2 text-amber-900 placeholder:text-amber-700/60"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-700 text-white hover:bg-amber-800"
            >
              Open
            </button>
          </form>
        </div>

        {/* Diagrams — Domain Hubs */}
        <div className="mb-10 rounded-2xl border border-amber-200 bg-white/95 shadow-md p-4 md:p-6">
          <h3 className="text-xl font-semibold mb-4 text-amber-900">Diagrams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Link href="/admin/diagrams/user-journeys" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-emerald-500/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-sky-900">
                  <MapIcon className="h-5 w-5 text-sky-700" />
                  <div className="font-semibold">User Journeys</div>
                </div>
                <div className="relative mt-1 text-sm text-sky-900/80">
                  End‑to‑end flows · Auth · Draft · Leagues
                </div>
              </div>
            </Link>
            <Link href="/admin/directory-map" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-sky-500/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-emerald-900">
                  <span className="inline-block h-5 w-5 rounded-sm bg-emerald-600" />
                  <div className="font-semibold">Directory Map</div>
                </div>
                <div className="relative mt-1 text-sm text-emerald-900/80">
                  What each folder contributes & key top-level files
                </div>
              </div>
            </Link>
            <Link href="/admin/diagrams/site-map" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-500/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-emerald-900">
                  <MapPinIcon className="h-5 w-5 text-emerald-700" />
                  <div className="font-semibold">Site Map</div>
                </div>
                <div className="relative mt-1 text-sm text-emerald-900/80">
                  Web · Mobile · Active · Final
                </div>
              </div>
            </Link>
            <Link href="/admin/diagrams/entity-relations" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-fuchsia-500/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-indigo-900">
                  <Squares2X2Icon className="h-5 w-5 text-indigo-700" />
                  <div className="font-semibold">Entity Relations</div>
                </div>
                <div className="relative mt-1 text-sm text-indigo-900/80">
                  Auth · Leagues · Draft · Scoring · Realtime
                </div>
              </div>
            </Link>
            <Link href="/admin/diagrams/workflows" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-sky-500/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-emerald-900">
                  <span className="inline-block h-5 w-5 rounded-sm bg-emerald-600" />
                  <div className="font-semibold">Workflows</div>
                </div>
                <div className="relative mt-1 text-sm text-emerald-900/80">
                  Production · Hotfix · Schema · Analytics · Handoff
                </div>
              </div>
            </Link>
            <Link
              href="/admin/diagrams/functional-flow"
              className="group block"
              style={{ display: 'none' }}
            >
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 via-orange-500/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-rose-900">
                  <BoltIcon className="h-5 w-5 text-rose-700" />
                  <div className="font-semibold">Functional Flow</div>
                </div>
                <div className="relative mt-1 text-sm text-rose-900/80">
                  Create/Join League · Auth · Draft
                </div>
              </div>
            </Link>
            <Link href="/admin/diagrams/draft" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-emerald-500/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-amber-900">
                  <TrophyIcon className="h-5 w-5 text-amber-700" />
                  <div className="font-semibold">Draft</div>
                </div>
                <div className="relative mt-1 text-sm text-amber-900/80">
                  User Flow · Entity Relation · API Routing
                </div>
              </div>
            </Link>
            <Link href="/admin/product-vision" className="group block">
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-white p-5 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-rose-400/10 to-transparent opacity-75" />
                <div className="relative flex items-center gap-3 text-amber-900">
                  <span className="inline-block h-5 w-5 rounded-sm bg-amber-600" />
                  <div className="font-semibold">Product Vision</div>
                </div>
                <div className="relative mt-1 text-sm text-amber-900/80">
                  UX planning, roadmap & principles
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Functional Flow and Project Map hubs deprecated in favor of User Journeys & Entity Relations */}

        {/* Admin Tools */}
        <div className="mb-10 bg-white/95 rounded-xl p-6 shadow-lg border border-amber-200">
          <h3 className="text-xl font-bold text-amber-900 mb-4">🛠️ Admin Tools</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-300 shadow-sm">
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
            <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 rounded-2xl border border-sky-300 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={refreshPlayers}
                  disabled={running}
                  className="px-3 py-2 rounded-xl bg-sky-700 text-white hover:bg-sky-800 disabled:opacity-50 shadow"
                >
                  Refresh Players (CFBD)
                </button>
                <button
                  onClick={reconcileDepth}
                  disabled={running}
                  className="px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 shadow"
                >
                  Reconcile Depth
                </button>
                <button
                  onClick={cronCleanup}
                  disabled={running}
                  className="px-3 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 shadow"
                >
                  Cron Cleanup
                </button>
                <button
                  onClick={dedupePlayers}
                  disabled={running}
                  className="px-3 py-2 rounded-xl bg-slate-700 text-white hover:bg-slate-800 disabled:opacity-50 shadow"
                >
                  Dedupe Players
                </button>
                <button
                  onClick={syncLeagueMembers}
                  disabled={running}
                  className="px-3 py-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 shadow"
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
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-amber-300 shadow-sm">
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
                {loadingDiagram ? (
                  <div className="text-amber-800 flex flex-col items-center justify-center py-12">
                    <Animated
                      src="https://assets1.lottiefiles.com/packages/lf20_wqkcaibn.json"
                      className="w-40 h-40"
                    />
                    <div className="mt-3 text-amber-800/80">Loading diagram…</div>
                  </div>
                ) : charts.length > 0 ? (
                  <div className="space-y-4 md:space-y-6">
                    {charts.map((chart: string, idx: number) => (
                      <div key={idx} className="p-0 bg-transparent">
                        <MermaidRenderer chart={chart} mode="modal" wheelZoom={true} />
                      </div>
                    ))}
                    {lastUpdated && (
                      <div className="mt-4 flex items-center gap-3">
                        <p className="text-sm text-amber-700">Last updated: {lastUpdated}</p>
                        <Animated
                          src="https://assets8.lottiefiles.com/packages/lf20_c8m1r3.json"
                          className="w-6 h-6"
                          autoplay={true}
                          loop={false}
                        />
                      </div>
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
