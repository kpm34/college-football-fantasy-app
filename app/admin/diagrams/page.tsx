'use client'

import { useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { Suspense, useEffect, useState } from 'react'

function DiagramsContent() {
  const params = useSearchParams()
  const file = params.get('file') || ''
  const debug = params.get('debug') === '1'
  const [signed, setSigned] = useState('')
  const [probe, setProbe] = useState<{ status?: number; ok?: boolean; error?: string } | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!file) return
    const run = async () => {
      try {
        const res = await fetch(`/api/docs/diagrams/sign?file=${encodeURIComponent(file)}`)
        const data = await res.json()
        if (!cancelled) setSigned(data.url || '')
        // Probe the URL so we can surface errors
        if (data?.url) {
          try {
            const head = await fetch(data.url, { method: 'GET', cache: 'no-store', mode: 'cors' })
            if (!cancelled) setProbe({ status: head.status, ok: head.ok })
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
        <div className="fixed top-2 left-2 z-50 bg-black/70 text-white text-xs p-3 rounded">
          <div className="font-semibold mb-1">Debug</div>
          <div>file: {file}</div>
          <div className="truncate max-w-[70vw]">signed: {signed}</div>
          <div>
            probe: {probe?.status ?? '-'}{' '}
            {probe?.ok ? '(ok)' : probe?.error ? `(error: ${probe.error})` : ''}
          </div>
          <div className="mt-1 space-x-2">
            <a href={signed} target="_blank" className="underline">
              Open raw
            </a>
            <a
              href={`${viewerHost}/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(signed)}`}
              target="_blank"
              className="underline"
            >
              Open viewer
            </a>
            <a
              href={`https://app.diagrams.net/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(signed)}`}
              target="_blank"
              className="underline"
            >
              Open via app.diagrams.net
            </a>
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
