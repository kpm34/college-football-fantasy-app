'use client'

import { useEffect, useState } from 'react'

const items = [
  { slug: 'entity-relations:core-er', title: 'Core Entity Relations' },
  { slug: 'entity-relations:auth-entity-relation', title: 'Auth ER' },
  { slug: 'entity-relations:leagues-entity-relation', title: 'Leagues ER' },
  { slug: 'entity-relations:draft-entity-relation', title: 'Draft ER' },
  { slug: 'entity-relations:projections-entity-relation', title: 'Projections ER' },
  { slug: 'entity-relations:scoring-entity-relation', title: 'Scoring ER' },
  { slug: 'entity-relations:realtime-entity-relation', title: 'Realtime ER' },
  { slug: 'entity-relations:ops-deploy-entity-relation', title: 'Ops/Deploy ER' },
]

function drawioFileForSlug(slug: string): string {
  const name = slug.split(':').slice(1).join('-')
  return `entity-relations/${name}.drawio`
}

export default function EntityRelationsPage() {
  const [hasDrawio, setHasDrawio] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const entries: Array<[string, boolean]> = await Promise.all(
        items.map(async i => {
          const rel = drawioFileForSlug(i.slug)
          try {
            const res = await fetch(`/api/docs/diagrams/${encodeURIComponent(rel)}?bypass=1`, {
              method: 'HEAD',
              cache: 'no-store',
            })
            return [i.slug, res.ok] as [string, boolean]
          } catch {
            return [i.slug, false] as [string, boolean]
          }
        })
      )
      if (!cancelled) {
        const next: Record<string, boolean> = {}
        for (const [slug, ok] of entries) next[slug] = ok
        setHasDrawio(next)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-2">Entity Relations</h1>
        <p className="text-neutral-700 text-sm mb-4">
          Prefer the Draw.io version for rich table-like shapes (headers, fields, PK/FK). Mermaid fallback is
          available for quick edits.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => {
            const drawioRel = drawioFileForSlug(i.slug)
            const showDrawio = Boolean(hasDrawio[i.slug])
            return (
              <div key={i.slug} className="rounded border border-neutral-200 bg-white shadow-sm p-3">
                <div className="font-semibold mb-2">{i.title}</div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
                    className="px-3 py-1 rounded bg-indigo-700 text-white text-sm hover:bg-indigo-800"
                  >
                    Open Mermaid
                  </a>
                  {showDrawio ? (
                    <a
                      href={`/admin/diagrams/viewer/${encodeURIComponent(drawioRel)}`}
                      className="px-3 py-1 rounded bg-emerald-700 text-white text-sm hover:bg-emerald-800"
                    >
                      Open Draw.io
                    </a>
                  ) : (
                    <a
                      href={`https://viewer.diagrams.net/?libs=er;general;flowchart`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded bg-neutral-200 text-neutral-800 text-sm hover:bg-neutral-300"
                      title="No Draw.io file found yet — opens viewer to create"
                    >
                      Create Draw.io
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
