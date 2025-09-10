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
    <div className="min-h-screen flex flex-col bg-[#0b1220] text-white">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between border-b border-white/10">
        <h1 className="text-xl md:text-2xl font-semibold truncate">{prettyTitle}</h1>
        <div className="flex items-center gap-3 text-sm">
          {updatedAt && <span className="opacity-75">Updated: {updatedAt}</span>}
          <Link href="/admin" className="underline hover:opacity-80">
            Admin
          </Link>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2 md:p-4">
        {error ? (
          <div className="p-4 bg-red-900/30 text-red-200 rounded border border-red-700/40">
            {error}
          </div>
        ) : (
          <MermaidRenderer charts={charts} mode="modal" />
        )}
      </div>
    </div>
  )
}
