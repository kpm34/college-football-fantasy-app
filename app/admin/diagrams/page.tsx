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
  const [useMx, setUseMx] = useState<boolean>(false)
  useEffect(() => {
    setFrameLoaded(false)
    setUseMx(false)
    setViewerHost('https://viewer.diagrams.net')
    // If not loaded within 3s, try app.diagrams.net (sometimes works better behind strict CSPs)
    const t = setTimeout(() => {
      if (!frameLoaded) setViewerHost('https://app.diagrams.net')
    }, 3000)
    // If not loaded within 6s, switch to static mxgraph viewer
    const t2 = setTimeout(() => {
      if (!frameLoaded) setUseMx(true)
    }, 6000)
    return () => {
      clearTimeout(t)
      clearTimeout(t2)
    }
  }, [signed])

  useEffect(() => {
    // no-op: ensure client
  }, [])

  if (!file) return <div className="p-8">No diagram specified.</div>
  if (!signed) return <div className="p-8 text-neutral-100">Signing URL…</div>

  return (
    <>
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
      {useMx ? (
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
