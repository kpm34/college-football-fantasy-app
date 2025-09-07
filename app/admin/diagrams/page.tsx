'use client'

import Link from 'next/link'

export default function DiagramsHubPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Diagrams</h1>
          <a href="/api/lucid/authorize" className="rounded px-4 py-2 bg-black text-white text-sm">
            Connect Lucid
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link href="/admin/diagrams/project-map" className="block rounded-lg p-4 bg-sky-700 text-white shadow">
            <div className="font-semibold">🗺️ Project Map</div>
            <div className="text-sm opacity-90">Overview · User Flow · Entity Relation · API/Events</div>
          </Link>
          <Link href="/admin/diagrams/system-architecture" className="block rounded-lg p-4 bg-indigo-700 text-white shadow">
            <div className="font-semibold">🏗️ System Architecture</div>
            <div className="text-sm opacity-90">Projections · Weight Tuning · Data Flow</div>
          </Link>
          <Link href="/admin/diagrams/functional-flow" className="block rounded-lg p-4 bg-rose-600 text-white shadow">
            <div className="font-semibold">⚡ Functional Flow</div>
            <div className="text-sm opacity-90">Create/Join League · Auth · Draft</div>
          </Link>
          <Link href="/admin/diagrams/draft" className="block rounded-lg p-4 bg-amber-700 text-white shadow">
            <div className="font-semibold">🏈 Draft</div>
            <div className="text-sm opacity-90">User Flow · Entity Relation · API Routing</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { Suspense, useEffect, useState } from 'react'

function DiagramsContent() {
  const params = useSearchParams()
  const file = params.get('file') || ''
  const debug = params.get('debug') === '1'
  const [signed, setSigned] = useState('')
  const [probe, setProbe] = useState<{
    status?: number
    ok?: boolean
    error?: string
    headers?: Record<string, string>
    durationMs?: number
  } | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!file) return
    const run = async () => {
      try {
        const startedAt = performance.now()
        const res = await fetch(`/api/docs/diagrams/sign?file=${encodeURIComponent(file)}`, {
          cache: 'no-store',
        })
        const data = await res.json()
        if (!cancelled) setSigned(data.url || '')
        // Probe the URL so we can surface errors
        if (data?.url) {
          try {
            const head = await fetch(data.url, { method: 'GET', cache: 'no-store', mode: 'cors' })
            const headers: Record<string, string> = {}
            head.headers.forEach((v, k) => {
              if (
                [
                  'content-type',
                  'content-length',
                  'access-control-allow-origin',
                  'access-control-allow-methods',
                  'access-control-expose-headers',
                  'cross-origin-resource-policy',
                  'x-content-type-options',
                  'content-disposition',
                ].includes(k)
              ) {
                headers[k] = v
              }
            })
            if (!cancelled)
              setProbe({
                status: head.status,
                ok: head.ok,
                headers,
                durationMs: Math.round(performance.now() - startedAt),
              })
          } catch (e: any) {
            if (!cancelled) setProbe({ error: e?.message || 'fetch failed' })
          }
        }
      } catch {
        if (!cancelled) setSigned('')
        if (!cancelled) setProbe({ error: 'sign failed' })
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [file])

  // Fallback viewer host if the default viewer doesn't render
  const [viewerHost, setViewerHost] = useState<string>('https://viewer.diagrams.net')
  const [frameLoaded, setFrameLoaded] = useState<boolean>(false)
  const [useMx, setUseMx] = useState<boolean>(false) // Start with iframe, fallback to others
  const [useSimple, setUseSimple] = useState<boolean>(false) // Simple viewer fallback
  useEffect(() => {
    setFrameLoaded(false)
    setUseSimple(false)
    setUseMx(false)
    setViewerHost('https://viewer.diagrams.net')

    // Start with iframe, fallback to mxGraph, then simple viewer
    const t1 = setTimeout(() => {
      if (!frameLoaded) {
        setUseMx(true)
      }
    }, 3000)

    const t2 = setTimeout(() => {
      if (!frameLoaded) {
        setUseSimple(true)
      }
    }, 6000)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [signed])

  useEffect(() => {
    // no-op: ensure client
  }, [])

  if (!file) return <div className="p-8">No diagram specified.</div>
  if (!signed) return <div className="p-8 text-neutral-100">Signing URL…</div>

  // Quick test URL for bypass
  const testUrl = `http://localhost:3000/api/docs/diagrams/mock-draft-flow`

  return (
    <>
      {/* Quick test buttons */}
      <div className="fixed top-16 left-2 z-40 space-y-2">
        <div className="bg-green-600 text-white px-3 py-2 rounded text-sm">
          <a
            href={`/admin/diagrams?file=draft-diagrams/mock-draft-flow.drawio&debug=1`}
            className="underline"
          >
            Test Mock Draft Flow
          </a>
        </div>
        <div className="bg-blue-600 text-white px-3 py-2 rounded text-sm">
          <a
            href={`http://localhost:3000/api/docs/diagrams/mock-draft-flow`}
            target="_blank"
            className="underline"
          >
            Raw Diagram File
          </a>
        </div>
        <div className="bg-purple-600 text-white px-3 py-2 rounded text-sm">
          <a
            href={`https://viewer.diagrams.net/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(testUrl)}`}
            target="_blank"
            className="underline"
          >
            Direct Viewer Test
          </a>
        </div>
        <div className="bg-red-600 text-white px-3 py-2 rounded text-sm">
          <a href={`http://localhost:3000/diagram-test.html`} target="_blank" className="underline">
            🔥 Full Test Suite
          </a>
        </div>
      </div>

      {debug && (
        <div className="fixed top-2 left-2 z-50 bg-black/80 text-white text-xs p-3 rounded max-w-[90vw]">
          <div className="flex items-center justify-between gap-4">
            <div className="font-semibold">Debug</div>
            <div className="opacity-80">
              {viewerHost.replace('https://', '')}
              {useMx ? ' · mxgraph' : frameLoaded ? ' · iframe-loaded' : ' · iframe-loading'}
            </div>
          </div>
          <div className="mt-2 space-y-2">
            <div>file: {file}</div>
            <div className="truncate max-w-[70vw]">signed: {signed}</div>
            <div>
              probe: {probe?.status ?? '-'}{' '}
              {probe?.ok ? '(ok)' : probe?.error ? `(error: ${probe.error})` : ''}{' '}
              {probe?.durationMs ? `· ${probe.durationMs}ms` : ''}
            </div>
            {probe?.headers && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 opacity-90">
                {Object.entries(probe.headers).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-white/70">{k}</span>
                    <span className="truncate max-w-[40vw]">{v}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              <button
                onClick={() => navigator.clipboard.writeText(signed)}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Copy URL
              </button>
              <button
                onClick={() =>
                  setViewerHost(h =>
                    h.includes('viewer')
                      ? 'https://app.diagrams.net'
                      : 'https://viewer.diagrams.net'
                  )
                }
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Toggle viewer host
              </button>
              <button
                onClick={() => {
                  setUseMx(false)
                  setViewerHost('https://viewer.diagrams.net')
                  setFrameLoaded(false)
                }}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Force iframe
              </button>
              <button
                onClick={() => setUseMx(true)}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Force mxgraph
              </button>
              <a
                href={signed}
                target="_blank"
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Open raw
              </a>
              <a
                href={`${viewerHost}/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(signed)}`}
                target="_blank"
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Open viewer
              </a>
              <a
                href={`https://app.diagrams.net/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(signed)}`}
                target="_blank"
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Open app.diagrams.net
              </a>
            </div>
            <div className="opacity-70">
              cookies:{' '}
              {typeof document !== 'undefined'
                ? document.cookie.includes('appwrite-session')
                  ? 'appwrite-session present'
                  : 'no appwrite-session'
                : 'n/a'}
            </div>
          </div>
        </div>
      )}
      {useSimple ? (
        <div className="w-full h-full overflow-auto bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">Mock Draft Flow Diagram</h2>
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
                  <strong className="text-blue-800">1. Create Mock Draft</strong>
                  <br />
                  <span className="text-blue-600">drafts.isMock = true</span>
                </div>
                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
                  <strong className="text-yellow-800">2. Load Player Pool</strong>
                  <br />
                  <span className="text-yellow-700">
                    college_players (Power4 + positions + draftable=true)
                  </span>
                </div>
                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
                  <strong className="text-yellow-800">3. Compute Projections</strong>
                  <br />
                  <span className="text-yellow-700">
                    Base + depth multipliers + prev stats + SoS
                  </span>
                </div>
                <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                  <strong className="text-green-800">4. Get Turn</strong>
                  <br />
                  <span className="text-green-700">Snake order by round</span>
                </div>
                <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                  <strong className="text-green-800">5. Apply Pick</strong>
                  <br />
                  <span className="text-green-700">
                    Validate availability + prevent duplicates + update draftState
                  </span>
                </div>
                <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-500">
                  <strong className="text-purple-800">6. Advance Clock</strong>
                  <br />
                  <span className="text-purple-700">Next team → getTurn() (mock - no timer)</span>
                </div>
                <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
                  <strong className="text-red-800">7. Results View</strong>
                  <br />
                  <span className="text-red-700">/mock-draft/[id]/results - Export board</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : useMx ? (
        <div className="w-full h-full">
          <Script
            src="https://viewer.diagrams.net/js/viewer-static.min.js"
            strategy="afterInteractive"
          />
          <div
            className="mxgraph"
            data-mxgraph={JSON.stringify({
              url: signed,
              highlight: '#0000ff',
              nav: 1,
              resize: 1,
              fit: 1,
              zoom: 1,
              toolbar: 'zoom lightbox',
            })}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ) : (
        <iframe
          key={viewerHost}
          src={`${viewerHost}/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(signed)}`}
          className="w-full h-full border-0"
          onLoad={() => setFrameLoaded(true)}
        />
      )}
    </>
  )
}

export default function DiagramsViewerPage() {
  return (
    <div className="w-screen h-screen bg-neutral-900">
      <Suspense fallback={<div className="p-8 text-neutral-100">Loading…</div>}>
        <DiagramsContent />
      </Suspense>
    </div>
  )
}
