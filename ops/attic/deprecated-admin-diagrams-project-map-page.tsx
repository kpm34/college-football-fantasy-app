'use client'

import { useEffect, useMemo, useState } from 'react'

export default function ProjectMapDiagramsPage() {
  const [items, setItems] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [busy, setBusy] = useState<string>('')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/docs/project-map-inventory', { cache: 'no-store' })
        const data = await res.json()
        const list = (data?.canonical_diagrams || []).filter((p: string) => p.endsWith('.md'))
        setItems(list)
      } catch (e: any) {
        setError(e?.message || 'Failed to load inventory')
      }
    }
    run()
  }, [])

  const groups = useMemo(() => {
    const HEADER_MAP: Record<string, string> = {
      overview: 'Overview',
      'user-flow': 'User Flow',
      'data-and-entity-relation': 'Entity Relation',
      'entity-relation': 'Entity Relation',
      'apis-and-events': 'APIs & Events',
      apis: 'APIs & Events',
    }
    const toTitle = (s: string) =>
      s
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, c => c.toUpperCase())

    type Entry = { slug: string; title: string }
    const grouped = new Map<string, Entry[]>()

    for (const p of items) {
      if (!p.includes('docs/diagrams/project-map/')) continue
      const rel = p.replace('docs/diagrams/project-map/', '')
      const parts = rel.split('/')
      const groupKey = parts.length > 1 ? parts[0] : 'overview'
      const header = HEADER_MAP[groupKey] || toTitle(groupKey)
      const fileName = parts[parts.length - 1].replace(/\.md$/, '')
      const title = toTitle(fileName)
      const slug = `project-map:${rel.replace(/\.md$/, '').replace(/\//g, ':')}`
      const arr = grouped.get(header) || []
      arr.push({ slug, title })
      grouped.set(header, arr)
    }

    // Sort entries within each group
    for (const [k, arr] of grouped) {
      arr.sort((a, b) => a.title.localeCompare(b.title))
      grouped.set(k, arr)
    }
    // Return as stable array of [header, entries]
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [items])

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Project Map Diagrams</h1>
        {error && <div className="text-red-700 mb-4">{error}</div>}

        {groups.length === 0 ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-8">
            {groups.map(([header, entries]) => (
              <section key={header}>
                <h2 className="text-lg font-semibold mb-3">{header}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entries.map(({ slug, title }) => (
                    <div key={slug} className="flex gap-2">
                      <a
                        href={`/admin/diagrams/${encodeURIComponent(slug)}`}
                        className="px-4 py-3 rounded bg-sky-700 text-white text-left shadow hover:bg-sky-800 flex-1"
                      >
                        <div className="font-semibold truncate">{title}</div>
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            setBusy(slug)
                            const res = await fetch('/api/lucid/import', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ slug, title }),
                            })
                            const json = await res.json()
                            if (!res.ok) throw new Error(json?.error || 'Import failed')
                            if (json?.openUrl) window.open(json.openUrl, '_blank')
                          } catch (e: any) {
                            alert(e?.message || 'Lucid import failed')
                          } finally {
                            setBusy('')
                          }
                        }}
                        className="px-4 py-3 rounded bg-black text-white text-sm whitespace-nowrap"
                        disabled={!!busy}
                        title="Open in Lucid"
                      >
                        {busy === slug ? 'Importing…' : 'Open in Lucid'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
