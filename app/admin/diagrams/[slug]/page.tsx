'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DiagramBySlugPage() {
  const params = useParams<{ slug: string }>()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const [charts, setCharts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>('')

  const formatET = (iso?: string) => {
    try {
      if (!iso) return ''
      const d = new Date(iso)
      const date = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
      }).format(d)
      const time = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
        .format(d)
        .replace(/\s?[AP]M/i, '')
      return `${date} ${time} ET`
    } catch {
      return iso || ''
    }
  }
  const [markdown, setMarkdown] = useState<string>('')

  // Derive a human-readable title from slug
  const decoded = decodeURIComponent(slug || '')
  const parts = decoded.split(':').filter(Boolean)
  const rawTitle = parts[parts.length - 1] || decoded
  const prettyTitle = rawTitle
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase())

  // Publicly accessible from Admin hubs; auth gating removed per product request

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!slug) return
      try {
        setError(null)
        const res = await fetch(`/api/docs/mermaid/${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))
        if (!cancelled) {
          if (res.ok && Array.isArray(data.charts)) {
            setCharts(data.charts)
            setUpdatedAt(data.updatedAt || '')
            // When no mermaid charts, try to fetch raw markdown and render it plainly
            if (!data.charts || data.charts.length === 0) {
              try {
                const p = String(data.path || '')
                if (p) {
                  const rel = p.replace(/^diagrams\//, '')
                  const mdRes = await fetch(`/api/docs/diagrams/${encodeURI(rel)}?bypass=1`, {
                    cache: 'no-store',
                  })
                  if (mdRes.ok) setMarkdown(await mdRes.text())
                }
              } catch {}
            }
          } else {
            setCharts([])
            setError(data?.error || `No diagram found for slug: ${slug}`)
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setCharts([])
          setError(e?.message || 'Failed to load diagram')
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

  // No auth gating; page is reachable only via admin UI

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#FFF8ED', color: '#1F2937' }}
    >
      <div
        className="px-4 md:px-6 py-3 flex items-center justify-between border-b"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <h1 className="text-2xl md:text-3xl font-extrabold font-bebas text-3d bg-clip-text text-transparent bg-gradient-to-r from-emerald-800 via-sky-700 to-indigo-700 tracking-wide truncate">
          {prettyTitle}
        </h1>
        <div className="flex items-center gap-3 text-sm" style={{ color: '#374151' }}>
          {updatedAt && <span className="opacity-75">Updated: {formatET(updatedAt)}</span>}
          <Link href="/admin" className="underline hover:opacity-80" style={{ color: '#0EA5E9' }}>
            Admin
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 md:p-4">
        {error ? (
          <div
            className="p-4 rounded border"
            style={{ backgroundColor: '#FDECEB', color: '#7F1D1D', borderColor: '#FCA5A5' }}
          >
            {error}
          </div>
        ) : charts && charts.length > 0 ? (
          <div className="space-y-3">
            {typeof slug === 'string' && slug.startsWith('user-journeys:') && (
              <div
                className="rounded border text-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  borderColor: 'rgba(16,185,129,.35)',
                }}
              >
                <div
                  className="px-3 py-2 font-semibold"
                  style={{ borderBottom: '1px solid rgba(16,185,129,.25)' }}
                >
                  Journey Legend
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <div>Terminator: rounded (Start/End)</div>
                    <div>Decision: diamond</div>
                    <div>Process: rectangle</div>
                  </div>
                  <div>
                    <div>Swimlanes: User | App (Next.js) | Appwrite | External</div>
                    <div>Async operations: dashed lines</div>
                  </div>
                </div>
              </div>
            )}
            <MermaidRenderer charts={charts} mode="modal" />
          </div>
        ) : markdown ? (
          <article className="prose max-w-none" style={{ color: '#1F2937' }}>
            <pre
              className="whitespace-pre-wrap break-words bg-transparent p-0 m-0"
              style={{ color: '#374151' }}
            >
              {markdown}
            </pre>
          </article>
        ) : (
          <div className="text-gray-600">No content available for this slug.</div>
        )}
      </div>
    </div>
  )
}
