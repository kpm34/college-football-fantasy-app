'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MermaidRenderer } from '@components/docs/MermaidRenderer'

type Diagram = { slug: string; title: string; group: 'Functional Flows' | 'App Structure' | 'API Routes' }

const DIAGRAMS: Diagram[] = [
  // Functional flows (3)
  { slug: 'functional-flow:draft', title: 'System Overview (Mock vs Real)', group: 'Functional Flows' },
  { slug: 'functional-flow:draft:real', title: 'Real Draft Flow', group: 'Functional Flows' },
  { slug: 'functional-flow:draft:mock', title: 'Mock Draft Flow', group: 'Functional Flows' },
  // App structure (3)
  { slug: 'project-map:app:draft', title: 'App — draft/', group: 'App Structure' },
  { slug: 'project-map:app:draft:draft', title: 'App — draft/draft/', group: 'App Structure' },
  { slug: 'project-map:app:draft:mock-draft', title: 'App — draft/mock-draft/', group: 'App Structure' },
  // API routes (1)
  { slug: 'project-map:app:api:drafts', title: 'API — app/api/drafts', group: 'API Routes' },
]

type DrawioDiagram = { file: string; title: string; group: 'Flows' | 'Operations' | 'Endpoints' | 'Timing' }

const DRAWIO_DIAGRAMS: DrawioDiagram[] = [
  // Flows
  { file: 'mock-real-draft-flows.drawio', title: 'System Overview (Mock vs Real)', group: 'Flows' },
  { file: 'mock-draft-flow.drawio', title: 'Mock Draft Flow', group: 'Flows' },
  { file: 'real-draft-flow.drawio', title: 'Real Draft Flow', group: 'Flows' },
  // Operations
  { file: 'draft-autopick-system.drawio', title: 'Autopick System', group: 'Operations' },
  { file: 'draft-database-board.drawio', title: 'Draft Database + Board', group: 'Operations' },
  // Endpoints
  { file: 'draft-api-endpoints.drawio', title: 'Draft API Endpoints', group: 'Endpoints' },
  // Timing
  { file: 'draft-comparison-timing.drawio', title: 'Timing Comparison', group: 'Timing' },
]

export default function DraftDiagramsPage() {
  const [current, setCurrent] = useState<null | { title: string; charts: string[]; updatedAt?: string; slug: string }>(null)
  const [currentDrawio, setCurrentDrawio] = useState<null | { title: string; file: string }>(null)
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
      const res = await fetch(`/api/docs/mermaid/${encodeURIComponent(slug)}`, { cache: 'no-store' })
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

  const openDrawio = (file: string, title: string) => {
    setCurrent(null)
    setCurrentDrawio({ file, title })
  }

  const groups: Array<Diagram['group']> = [] // Deprecated mermaid groups for drafts (we use drawio below)
  const drawioGroups: Array<DrawioDiagram['group']> = ['Flows', 'Operations', 'Endpoints', 'Timing']

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAEEE1 0%, #FFF8ED 40%, #F2E5D5 100%)' }}>
        <div className="text-amber-800">Loading...</div>
      </div>
    )
  }

  const isAdmin = userEmail === 'kashpm2002@gmail.com'

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FAEEE1 0%, #FFF8ED 40%, #F2E5D5 100%)' }}>
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold" style={{ color: '#5B2E0F' }}>Draft System Diagrams</h1>
          {isAdmin && (
            <Link href="/admin" className="px-3 py-2 rounded bg-amber-700 text-white hover:bg-amber-800">Back to Admin</Link>
          )}
        </div>

        {drawioGroups.map((g) => (
          <div key={g} className="mb-8">
            <h3 className="text-lg font-semibold mb-3" style={{ color: '#5B2E0F' }}>{g}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {DRAWIO_DIAGRAMS.filter(d => d.group === g).map((d) => (
                <button
                  key={d.file}
                  onClick={() => openDrawio(d.file, d.title)}
                  className="px-4 py-4 rounded-xl shadow-md text-left transition-all"
                  style={{ background:'#1E3A8A', color:'#fff' }}
                >
                  <div className="font-semibold">{d.title}</div>
                  <div className="text-sm text-sky-100 truncate">{d.file}</div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mt-6 text-amber-800">Loading…</div>
        )}
        {error && (
          <div className="mt-6 p-3 rounded border border-rose-300 bg-rose-50 text-rose-800">{error}</div>
        )}

        {currentDrawio && (
          <div className="mt-6 bg-white/90 rounded-xl p-4 shadow border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold" style={{ color: '#5B2E0F' }}>{currentDrawio.title}</h2>
              <div className="flex items-center gap-2">
                <a href={`/admin/diagrams?file=${currentDrawio.file}`} target="_blank" className="px-3 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800">Open in New Tab</a>
                <button onClick={() => setCurrentDrawio(null)} className="px-3 py-1 rounded bg-stone-700 text-white hover:bg-stone-800">Close</button>
              </div>
            </div>
            <iframe 
              src={`https://viewer.diagrams.net/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(window.location.origin + '/docs/draft/' + currentDrawio.file)}`}
              className="w-full h-[70vh] border rounded" 
            />
          </div>
        )}

        {current && current.charts?.length > 0 && (
          <div className="mt-6 bg-white/90 rounded-xl p-4 shadow border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold" style={{ color: '#5B2E0F' }}>{current.title}</h2>
              <button
                onClick={() => setCurrent(null)}
                className="px-3 py-1 rounded bg-stone-700 text-white hover:bg-stone-800"
              >Close</button>
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


