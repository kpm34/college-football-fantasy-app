'use client'

import { useEffect, useState } from 'react'

export default function ProjectMapDiagramsPage() {
  const [items, setItems] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [busy, setBusy] = useState<string>('')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/docs/diagrams/project-map/_inventory.json', { cache: 'no-store' })
        const data = await res.json()
        const list = (data?.canonical_diagrams || []).filter((p: string) => p.endsWith('.md'))
        setItems(list)
      } catch (e: any) {
        setError(e?.message || 'Failed to load inventory')
      }
    }
    run()
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Project Map Diagrams</h1>
        {error && <div className="text-red-700 mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((p: string) => {
            const slug = `project-map:${p.replace('docs/diagrams/project-map/', '').replace(/\.md$/, '').replace(/\//g, ':')}`
            const name = p.split('/').slice(-1)[0].replace(/\.md$/, '')
            return (
              <div key={p} className="flex gap-2">
                <button
                  onClick={async () => {
                    await fetch(`/api/docs/mermaid/${encodeURIComponent(slug)}`)
                    // open modal via window event consumed by Admin page
                    window.dispatchEvent(new CustomEvent('open-mermaid', { detail: { slug, title: name } }))
                  }}
                  className="px-4 py-3 rounded bg-sky-700 text-white text-left shadow hover:bg-sky-800 flex-1"
                >
                  <div className="font-semibold truncate">{name}</div>
                  <div className="text-xs opacity-80 truncate">{slug}</div>
                </button>
                <button
                  onClick={async () => {
                    try {
                      setBusy(slug)
                      const res = await fetch('/api/lucid/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ slug, title: name }),
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
            )
          })}
        </div>
      </div>
    </div>
  )
}


