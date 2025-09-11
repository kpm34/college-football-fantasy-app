'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export default function DiagramBySlugPage() {
  const params = useParams<{ slug: string }>()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const [charts, setCharts] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'default' | 'treemap' | 'syntax_error'>('default')
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
            const isUJ = typeof slug === 'string' && slug.startsWith('user-journeys:')
            const filtered = isUJ
              ? (data.charts as string[]).filter(
                  (c: string) =>
                    !/Legend\s*Only/i.test(c) &&
                    !/subgraph\s+L\[/i.test(c) &&
                    !/subgraph\s+L2\[/i.test(c) &&
                    !/\bJourney\s+flow\s+key\b/i.test(c)
                )
              : data.charts
            setCharts(filtered)
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

  // Alternate views: treemap, syntax error demo
  const displayCharts = useMemo(() => {
    if (!charts || charts.length === 0) return []
    if (viewMode === 'syntax_error') {
      return [['flowchart TD', '  A["Unclosed label example', '  A --> B'].join('\n')]
    }
    if (viewMode === 'treemap') {
      try {
        return [buildTreemapFromCharts(charts)]
      } catch {
        return charts
      }
    }
    return charts
  }, [charts, viewMode])

  function buildTreemapFromCharts(srcCharts: string[]): string {
    const all = srcCharts.join('\n')
    const routeMatches = Array.from(all.matchAll(/"\/[^"]+"/g)).map(m => m[0].slice(1, -1))
    const routes = Array.from(new Set(routeMatches))
    const groups: Record<string, string[]> = {}
    const groupFor = (r: string) => {
      const seg = (r.split('/')[1] || '').toLowerCase()
      if (seg === 'login' || seg === 'signup' || seg === 'auth') return 'Auth'
      if (seg === 'dashboard' || seg === 'account-settings') return 'Dashboard'
      if (seg === 'league') return 'League'
      if (seg === 'draft') return 'Draft'
      if (seg === 'admin') return 'Admin'
      if (
        seg === 'videos' ||
        seg === 'projection-showcase' ||
        seg === 'conference-showcase' ||
        seg === 'launch' ||
        seg === 'offline' ||
        seg === 'scoreboard' ||
        seg === 'standings' ||
        seg === 'client-brief'
      )
        return 'Public'
      if (seg === 'invite') return 'Auth'
      return 'Other'
    }
    for (const r of routes) {
      const g = groupFor(r)
      if (!groups[g]) groups[g] = []
      groups[g].push(r)
    }
    const lines: string[] = []
    lines.push('treemap TB')
    lines.push('  ["Site Map"]')
    const groupKeys = Object.keys(groups).sort()
    for (const g of groupKeys) {
      lines.push(`    ["${g}"]`)
      for (const r of groups[g].sort()) {
        lines.push(`      ["${r}"]`)
      }
    }
    return lines.join('\n')
  }

  function download(text: string, filename: string, mime = 'text/plain') {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportLucidCSV() {
    // Basic nodes CSV for Lucid Data panel: Id,Label,Group,URL
    const code = charts.join('\n')
    const labelMatches = Array.from(code.matchAll(/([A-Za-z0-9_]+)\["([^"]+)"\]/g))
    const idToLabel = new Map<string, string>()
    for (const m of labelMatches) idToLabel.set(m[1], m[2])
    const directLabels = Array.from(code.matchAll(/"\/[^"]+"/g)).map(m => m[0].slice(1, -1))
    const rows: Array<{ id: string; label: string; group: string; url: string }> = []
    const seen = new Set<string>()
    const add = (id: string, label: string) => {
      if (seen.has(label)) return
      seen.add(label)
      const seg = (label.split('/')[1] || '').toLowerCase()
      const group = seg ? seg[0].toUpperCase() + seg.slice(1) : 'Root'
      const url = label.startsWith('/') ? `https://cfbfantasy.app${label}` : ''
      rows.push({ id, label, group, url })
    }
    for (const [id, label] of idToLabel) add(id, label)
    for (const label of directLabels) add(label, label)
    const header = 'Id,Label,Group,URL\n'
    const body = rows
      .map(r => [r.id, r.label, r.group, r.url].map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    download(header + body + '\n', `lucid-nodes-${slug || 'diagram'}.csv`, 'text/csv')
  }

  function exportLucidEdgesCSV() {
    // Edges CSV: From,To
    const code = charts.join('\n')
    const lines = code.split(/\n/)
    const edges: Array<{ from: string; to: string }> = []
    const idToLabel: Record<string, string> = {}
    for (const m of code.matchAll(/([A-Za-z0-9_]+)\["([^"]+)"\]/g)) {
      idToLabel[m[1]] = m[2]
    }
    for (const ln of lines) {
      const m = ln.match(/\s*([^\s-]+)\s*--?>+\s*([^\s;]+)/)
      if (!m) continue
      const rawFrom = m[1]
      const rawTo = m[2]
      const toLabel = rawTo.startsWith('"') ? rawTo.slice(1, -1) : idToLabel[rawTo] || rawTo
      const fromLabel = idToLabel[rawFrom] || (rawFrom.startsWith('"') ? rawFrom.slice(1, -1) : rawFrom)
      edges.push({ from: fromLabel, to: toLabel })
    }
    const header = 'From,To\n'
    const body = edges.map(e => [e.from, e.to].map(v => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n')
    download(header + body + '\n', `lucid-edges-${slug || 'diagram'}.csv`, 'text/csv')
  }

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
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide truncate bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-orange-600 to-emerald-600 text-3d">
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
              <div className="grid gap-3 md:grid-cols-[260px,1fr] items-start">
                <aside className="sticky top-24 self-start hidden md:block">
                  <div
                    className="rounded border text-sm"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937',
                      borderColor: 'rgba(148,163,184,.35)',
                    }}
                  >
                    <div
                      className="px-3 py-2 font-semibold"
                      style={{ borderBottom: '1px solid rgba(148,163,184,.25)' }}
                    >
                      Key
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-5 h-5 rounded-full border"
                          style={{ background: '#93C5FD', borderColor: '#1D4ED8' }}
                        />
                        <span>Terminator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-5 h-5 border rotate-45"
                          style={{ background: '#EDE9FE', borderColor: '#7C3AED' }}
                        />
                        <span>Decision</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-5 h-3 border"
                          style={{ background: '#E5E7EB', borderColor: '#6B7280' }}
                        />
                        <span>Process</span>
                      </div>
                    </div>
                  </div>
                </aside>
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm" style={{ color: '#374151' }}>
                      View:
                    </label>
                    <select
                      value={viewMode}
                      onChange={e => setViewMode(e.target.value as any)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="default">Flowchart (default)</option>
                      <option value="treemap">Treemap (fold by section)</option>
                      <option value="syntax_error">Syntax error example</option>
                    </select>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={exportLucidCSV}
                        className="border rounded px-2 py-1 text-sm hover:bg-emerald-50"
                        style={{ borderColor: 'rgba(16,185,129,.35)', color: '#065F46' }}
                      >
                        Export Nodes CSV (Lucid)
                      </button>
                      <button
                        onClick={exportLucidEdgesCSV}
                        className="border rounded px-2 py-1 text-sm hover:bg-emerald-50"
                        style={{ borderColor: 'rgba(16,185,129,.35)', color: '#065F46' }}
                      >
                        Export Edges CSV
                      </button>
                    </div>
                  </div>
                  <MermaidRenderer charts={displayCharts} mode="modal" />
                </section>
              </div>
            )}
            {typeof slug === 'string' && slug.startsWith('workflows:') && (
              <div
                className="rounded border text-sm"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#1F2937',
                  borderColor: 'rgba(59,130,246,.35)',
                }}
              >
                <div
                  className="px-3 py-2 font-semibold"
                  style={{ borderBottom: '1px solid rgba(59,130,246,.25)' }}
                >
                  Workflow Legend
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded"
                      style={{ background: '#ECFDF5', border: '1px solid #10B981' }}
                    />
                    <span>Lane: Design / Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded"
                      style={{ background: '#EFF6FF', border: '1px solid #3B82F6' }}
                    />
                    <span>Lane: Engineering / Pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded"
                      style={{ background: '#FFFBEB', border: '1px solid #F59E0B' }}
                    />
                    <span>Lane: Review / App / Launch</span>
                  </div>
                </div>
              </div>
            )}
            {!String(slug).startsWith('user-journeys:') && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm" style={{ color: '#374151' }}>
                    View:
                  </label>
                  <select
                    value={viewMode}
                    onChange={e => setViewMode(e.target.value as any)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="default">Flowchart (default)</option>
                    <option value="treemap">Treemap (fold by section)</option>
                    <option value="syntax_error">Syntax error example</option>
                  </select>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={exportLucidCSV}
                      className="border rounded px-2 py-1 text-sm hover:bg-emerald-50"
                      style={{ borderColor: 'rgba(16,185,129,.35)', color: '#065F46' }}
                    >
                      Export Nodes CSV (Lucid)
                    </button>
                    <button
                      onClick={exportLucidEdgesCSV}
                      className="border rounded px-2 py-1 text-sm hover:bg-emerald-50"
                      style={{ borderColor: 'rgba(16,185,129,.35)', color: '#065F46' }}
                    >
                      Export Edges CSV
                    </button>
                  </div>
                </div>
                <MermaidRenderer charts={displayCharts} mode="modal" />
              </>
            )}
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
