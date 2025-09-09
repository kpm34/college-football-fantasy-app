'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import { useAuth } from '@lib/hooks/useAuth'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DiagramBySlugPage() {
  const params = useParams<{ slug: string }>()
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const { user, loading } = useAuth()
  const [charts, setCharts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>('')

  // Dev-only admin bypass (mirrors /admin)
  const devBypass = (() => {
    if (typeof window === 'undefined') return false
    if (process.env.NODE_ENV === 'production') return false
    const envToken = process.env.NEXT_PUBLIC_ADMIN_DEV_TOKEN || ''
    const envEmail = (process.env.NEXT_PUBLIC_ADMIN_DEV_EMAIL || '').toLowerCase()
    try {
      const url = new URL(window.location.href)
      const qp = url.searchParams.get('devAdmin')
      if (qp) {
        window.localStorage.setItem('admin-dev-token', qp)
        url.searchParams.delete('devAdmin')
        window.history.replaceState({}, '', url.toString())
      }
    } catch {}
    const lsToken = typeof window !== 'undefined' ? window.localStorage.getItem('admin-dev-token') || '' : ''
    const userEmail = (user?.email || '').toLowerCase()
    if (envToken && lsToken && envToken === lsToken) return true
    if (envEmail && userEmail === envEmail) return true
    return false
  })()

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-amber-900">Loading…</div>
    )
  }

  const hardcodedAdmin = (user?.email || '').toLowerCase() === 'kashpm2002@gmail.com'

  if (!hardcodedAdmin && !devBypass) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Unauthorized</div>
          <Link href="/" className="text-sky-700 hover:text-sky-900 underline">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-amber-900 break-all">Diagram: {slug}</h1>
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-sky-700 hover:text-sky-900 underline">
              Admin
            </Link>
            {updatedAt && <span className="text-amber-700 text-sm">Updated: {updatedAt}</span>}
          </div>
        </div>
        {error ? (
          <div className="p-4 bg-amber-100 text-amber-900 rounded border border-amber-300">
            {error}
          </div>
        ) : (
          <div className="bg-[#0b1220] rounded border border-amber-300">
            <MermaidRenderer charts={charts} mode="page" />
          </div>
        )}
      </div>
    </div>
  )
}
