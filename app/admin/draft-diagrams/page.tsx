'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Diagram = {
  slug: string
  title: string
  group: 'Functional Flows' | 'App Structure' | 'API Routes'
}

const DIAGRAMS: Diagram[] = [
  // Functional flows (3)
  {
    slug: 'functional-flow:draft',
    title: 'System Overview (Mock vs Real)',
    group: 'Functional Flows',
  },
  { slug: 'functional-flow:draft:real', title: 'Real Draft Flow', group: 'Functional Flows' },
  { slug: 'functional-flow:draft:mock', title: 'Mock Draft Flow', group: 'Functional Flows' },
  // App structure (3)
  { slug: 'project-map:app:draft', title: 'App — draft/', group: 'App Structure' },
  { slug: 'project-map:app:draft:draft', title: 'App — draft/draft/', group: 'App Structure' },
  {
    slug: 'project-map:app:draft:mock-draft',
    title: 'App — draft/mock-draft/',
    group: 'App Structure',
  },
  // API routes (1)
  { slug: 'project-map:app:api:drafts', title: 'API — app/api/drafts', group: 'API Routes' },
]

type DrawioDiagram = {
  file: string
  title: string
  group: 'Flows' | 'Operations' | 'Endpoints' | 'Timing'
}

const DRAWIO_DIAGRAMS: DrawioDiagram[] = []

export default function DraftDiagramsPage() {
  const [current, setCurrent] = useState<null | {
    title: string
    charts: string[]
    updatedAt?: string
    slug: string
  }>(null)
  // Navigates to per-diagram pages instead of inline viewer
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Check user authentication client-side
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/user')
        if (res.ok) {
          const data = await res.json()
          setUserEmail(data.email || null)
        }
      } catch (err) {
        console.log('Not authenticated')
      } finally {
        setCheckingAuth(false)
      }
    }
    checkUser()
  }, [])

  const open = async (slug: string, title: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/docs/mermaid/${encodeURIComponent(slug)}`, {
        cache: 'no-store',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load diagram')
      setCurrent({ title, charts: data.charts || [], updatedAt: data.updatedAt, slug })
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
      setCurrent(null)
    } finally {
      setLoading(false)
    }
  }

  const router = useRouter()

  const groups: Array<Diagram['group']> = [] // Deprecated mermaid groups for drafts (we use drawio below)
  const drawioGroups: Array<DrawioDiagram['group']> = ['Flows', 'Operations', 'Endpoints', 'Timing']
  const [diagrams, setDiagrams] = useState<DrawioDiagram[]>([])

  useEffect(() => {
    // Fetch latest diagrams list from docs/diagrams/draft-diagrams
    fetch('/api/docs/diagrams/draft/list', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => setDiagrams(Array.isArray(d.items) ? d.items : []))
      .catch(() => setDiagrams([]))
  }, [])

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #FAEEE1 0%, #FFF8ED 40%, #F2E5D5 100%)' }}
      >
        <div className="text-amber-800">Loading...</div>
      </div>
    )
  }

  const isAdmin = userEmail === 'kashpm2002@gmail.com'

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #FAEEE1 0%, #FFF8ED 40%, #F2E5D5 100%)' }}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold" style={{ color: '#5B2E0F' }}>
            Draft System Diagrams
          </h1>
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded bg-amber-700 text-white hover:bg-amber-800"
            >
              Back to Admin
            </Link>
          )}
        </div>

        {drawioGroups.map(g => (
          <div key={g} className="mb-8">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#5B2E0F' }}>
              {g}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {diagrams
                .filter(d => d.group === g)
                .map(d => {
                  const base = d.file.split('/').pop() || d.file
                  return (
                    <button
                      key={d.file}
                      onClick={() =>
                        router.push(`/admin/draft-diagrams/${encodeURIComponent(base)}`)
                      }
                      className="px-4 py-4 rounded-xl shadow-md text-left transition-all"
                      style={{ background: '#1E3A8A', color: '#fff' }}
                    >
                      <div className="font-semibold">{d.title}</div>
                      <div className="text-sm text-sky-100 truncate">{base}</div>
                    </button>
                  )
                })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {diagrams.length === 0 && (
          <div className="mt-6 p-4 rounded border border-amber-300 bg-amber-50 text-amber-900">
            No draft diagrams yet. Add .drawio or .md files in{' '}
            <code>docs/diagrams/draft-diagrams</code> and refresh.
          </div>
        )}

        {loading && <div className="mt-6 text-amber-800">Loading…</div>}
        {error && (
          <div className="mt-6 p-3 rounded border border-rose-300 bg-rose-50 text-rose-800">
            {error}
          </div>
        )}

        {/* Inline viewer removed: each diagram now opens on its own page */}

        {current && current.charts?.length > 0 && (
          <div className="mt-6 bg-white/90 rounded-xl p-4 shadow border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold" style={{ color: '#5B2E0F' }}>
                {current.title}
              </h2>
              <button
                onClick={() => setCurrent(null)}
                className="px-3 py-1 rounded bg-stone-700 text-white hover:bg-stone-800"
              >
                Close
              </button>
            </div>
            <MermaidRenderer charts={current.charts} mode="page" />
            {current.updatedAt && (
              <p className="text-sm text-stone-600 mt-3">Last updated: {current.updatedAt}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
