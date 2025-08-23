'use client'

import { useEffect, useState } from 'react'
import { MermaidRenderer } from './MermaidRenderer'

interface Props {
  root: string
}

export function ProjectMapClient({ root }: Props) {
  const [charts, setCharts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [debug, setDebug] = useState<any>(null)
  // Ensure a consistent slug available to both the effect and debug panel
  const slug = root.startsWith('project-map:') ? root : `project-map:${root}`

  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const encoded = encodeURIComponent(slug).replace(/%3A/g, ':')
        const res = await fetch(`/api/docs/mermaid/${encoded}`, { cache: 'no-store' })
        const json = await res.json()
        setDebug({ status: res.status, json })
        if (!isMounted) return
        if (Array.isArray(json.charts)) setCharts(json.charts)
        else setError(json.error || 'No charts found')
      } catch (e: any) {
        if (!isMounted) return
        setError(e?.message || 'Failed to load diagram')
        setDebug({ thrown: String(e?.message || e) })
      }
    })()
    return () => { isMounted = false }
  }, [root])

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">{error ? `Error: ${error}` : `Charts: ${charts.length}`}</div>
      {charts.length > 0 ? (
        <MermaidRenderer charts={charts} />
      ) : (
        <div className="text-gray-400 text-sm">{error || 'Loading diagram…'}</div>
      )}
      <details className="mt-4 text-xs text-gray-400">
        <summary className="cursor-pointer">Debug details</summary>
        <pre className="mt-2 p-3 bg-black/40 rounded overflow-auto">
{JSON.stringify({ root, error, debug }, null, 2)}
        </pre>
        <div className="mt-2">
          <a
            href={`/api/docs/mermaid/${encodeURIComponent(slug)}`}
            target="_blank"
            className="underline text-blue-300"
            rel="noreferrer"
          >
            Open API response
          </a>
        </div>
      </details>
    </div>
  )
}


