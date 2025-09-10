'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

interface ChapterSpec {
  key: string
  title: string
}

const CHAPTERS: ChapterSpec[] = [
  { key: 'app', title: 'app/' },
  { key: 'components', title: 'components/' },
  { key: 'lib', title: 'lib/' },
  { key: 'docs', title: 'docs/' },
  { key: 'functions', title: 'functions/' },
  { key: 'schema', title: 'schema/' },
  { key: 'ops', title: 'ops/' },
]

type FileInfo = { path: string; description: string; anchor?: string }
const IMPORTANT_FILES: Record<string, Array<FileInfo>> = {
  app: [
    { path: 'app/layout.tsx', description: 'Root layout & metadata for all routes' },
    { path: 'app/globals.css', description: 'Global CSS and Tailwind layers' },
    { path: 'app/admin/page.tsx', description: 'Admin dashboard entry' },
  ],
  components: [
    { path: 'components/index.ts', description: 'Barrel exports for UI/components' },
    {
      path: 'components/docs/MermaidRenderer.tsx',
      description: 'Diagram renderer used across Admin',
    },
  ],
  lib: [
    { path: 'lib/appwrite-server.ts', description: 'Privileged Appwrite client (server-only)' },
    { path: 'lib/repos', description: 'Repository/data access layer' },
    { path: 'lib/hooks', description: 'Client/server hooks (auth, realtime, etc.)' },
  ],
  docs: [
    { path: 'docs/diagrams', description: 'All diagrams rendered in Admin' },
    {
      path: 'docs/architecture-decision-records',
      description: 'Architecture Decision Records (ADRs)',
    },
  ],
  functions: [
    { path: 'functions/appwrite', description: 'Appwrite HTTP/webhooks/triggers' },
    { path: 'functions/workers', description: 'Workers for polling/ETL/cron' },
  ],
  schema: [
    {
      path: 'schema/zod-schema.ts',
      description: 'SSOT for collections; run generators after edits',
    },
    { path: 'schema/indexes.ts', description: 'Declared indexes for Appwrite' },
  ],
  ops: [
    { path: 'ops/attic', description: 'Archived/legacy materials' },
    { path: 'ops/diagrams', description: 'Generators and helpers for diagrams' },
  ],
}

export default function DirectoryMapPage() {
  const [active, setActive] = useState<string>('app')
  const [markdown, setMarkdown] = useState<string>('')
  const [charts, setCharts] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const chapter = useMemo(() => CHAPTERS.find(c => c.key === active), [active])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      setMarkdown('')
      setCharts([])
      try {
        // Load Mermaid diagrams for the chapter
        const slug = `directory-map:chapters:${active}`
        const mermaidRes = await fetch(`/api/docs/mermaid/${encodeURIComponent(slug)}`, {
          cache: 'no-store',
        })
        if (mermaidRes.ok) {
          const data = await mermaidRes.json()
          if (!cancelled) setCharts(Array.isArray(data?.charts) ? data.charts : [])
        }
        // Load markdown for the chapter (doc text)
        const mdRes = await fetch(
          `/api/docs/diagrams/${encodeURIComponent(`directory-map/chapters/${active}.md`)}?bypass=1`,
          { cache: 'no-store' }
        )
        if (mdRes.ok) {
          const text = await mdRes.text()
          if (!cancelled) setMarkdown(text || '')
        } else {
          if (!cancelled) setMarkdown('')
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load chapter')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [active])

  // Overlay (simple sheet) for important files
  const [overlay, setOverlay] = useState<{
    open: boolean
    title?: string
    desc?: string
    content?: string
  }>({ open: false })

  const files = IMPORTANT_FILES[active] || []

  // Structured descriptions for each chapter to ensure consistent formatting
  const CHAPTER_CONTENT: Record<
    string,
    { overview: string; keyFolders: Array<{ name: string; description: string }> }
  > = {
    app: {
      overview:
        'Next.js App Router entrypoint. Contains public marketing routes under `(league)`, authenticated dashboards under `(dashboard)`, admin tools under `/admin`, and API routes in `/api` segmented by backend/frontend/external.',
      keyFolders: [
        {
          name: 'app/(league)',
          description: 'Marketing and auth pages (public). Minimal client JS.',
        },
        {
          name: 'app/(dashboard)',
          description: 'Authenticated user experience: leagues, draft, scoreboard.',
        },
        {
          name: 'app/admin',
          description: 'Admin utilities and diagrams viewer. Restricted access.',
        },
        {
          name: 'app/api',
          description: 'Route handlers grouped by `(backend)`, `(frontend)`, `(external)`.',
        },
      ],
    },
    components: {
      overview:
        "Reusable UI building blocks and feature components. Follows the project standards: no data fetching in components; receive data via props; only interactive pieces declare 'use client'.",
      keyFolders: [
        { name: 'components/ui', description: 'shadcn/ui primitives styled with Tailwind.' },
        {
          name: 'components/features',
          description: 'Feature-scoped components, e.g., draft and leagues.',
        },
        {
          name: 'components/layout',
          description: 'Layout and portal components shared across routes.',
        },
      ],
    },
    lib: {
      overview:
        'Core business logic and data access. Keep UI out of `lib/**`. Centralizes repositories, hooks, Appwrite clients, and shared types.',
      keyFolders: [
        { name: 'lib/db', description: 'Database helpers and low-level clients.' },
        {
          name: 'lib/repos',
          description: 'Repository layer with domain-oriented read/write methods.',
        },
        { name: 'lib/hooks', description: 'Cross-cutting React hooks, e.g., auth and realtime.' },
        {
          name: 'lib/types',
          description: 'Shared TypeScript types used across server and client.',
        },
        {
          name: 'lib/services',
          description: 'Business services orchestrating repositories and rules.',
        },
      ],
    },
    docs: {
      overview:
        'Documentation, diagrams, and guides. Admin pages render diagrams from here. Also includes ADRs and developer guides.',
      keyFolders: [
        {
          name: 'docs/diagrams',
          description: 'Mermaid/Draw.io/Excalidraw sources rendered in Admin.',
        },
        {
          name: 'docs/architecture-decision-records',
          description: 'Key architectural decisions and rationale.',
        },
      ],
    },
    functions: {
      overview:
        'Serverless functions for Appwrite triggers/webhooks and scheduled workers. Each function lives in its own folder with `index.ts` as the entry point and `local.ts` for local testing.',
      keyFolders: [
        {
          name: 'functions/appwrite',
          description: 'Appwrite HTTP/webhooks/triggers (one folder per function).',
        },
        { name: 'functions/workers', description: 'ETL/cron jobs not bound to Appwrite triggers.' },
        { name: 'functions/cron', description: 'Schedule definitions and wrappers.' },
      ],
    },
    schema: {
      overview:
        'Single Source of Truth (SSOT) for Appwrite. After edits, regenerate types and sync to Appwrite. Avoid defaults for required fields per rules.',
      keyFolders: [
        {
          name: 'schema/zod-schema.ts',
          description: 'Canonical zod schema for collections and attributes.',
        },
        { name: 'schema/indexes.ts', description: 'Declared indexes to ensure query performance.' },
      ],
    },
    ops: {
      overview:
        'Operational scripts, tooling, and automation. Use `ops/attic` for legacy artifacts to keep the root clean.',
      keyFolders: [
        { name: 'ops/diagrams', description: 'Diagram generators and helpers.' },
        { name: 'ops/attic', description: 'Archived/legacy materials retained for reference.' },
      ],
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-sky-600 to-indigo-600">
            Directory Map
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sky-700 hover:text-sky-900 underline text-sm">
              Back to Admin
            </Link>
            <Link
              className="text-emerald-700 hover:text-emerald-900 underline text-sm"
              href="/admin/diagrams/directory-map"
            >
              Open as Diagrams List
            </Link>
          </div>
        </div>

        {/* Body: two-column layout. Sidebar | Content */}
        <div className="grid gap-6 lg:grid-cols-[280px,1fr] items-start">
          {/* Sidebar: Chapter navigation + Important files */}
          <aside className="hidden lg:block sticky top-24 self-start space-y-4">
            {/* Chapter Navigation (bar) */}
            <nav className="rounded-2xl border border-emerald-200 bg-white/90 shadow p-2">
              <div className="text-sm font-semibold text-emerald-800 px-2 pb-1">Chapters</div>
              <ul className="space-y-1">
                {CHAPTERS.map(c => (
                  <li key={c.key}>
                    <button
                      onClick={() => setActive(c.key)}
                      aria-current={active === c.key ? 'page' : undefined}
                      className={`w-full text-left px-3 py-2 rounded-md transition border ${
                        active === c.key
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow'
                          : 'bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Important files */}
            <div className="rounded-2xl border border-emerald-200 bg-white/90 shadow p-4 text-sm text-emerald-900">
              <div className="font-semibold text-emerald-800 mb-2">Important files</div>
              <ul className="space-y-2">
                {files.length === 0 && (
                  <li className="text-emerald-800/70">None listed for this chapter.</li>
                )}
                {files.map(f => (
                  <li key={f.path}>
                    <button
                      className="underline hover:text-emerald-700"
                      onClick={async () => {
                        try {
                          const res = await fetch(
                            `/api/docs/diagrams/${encodeURI(f.path)}?bypass=1`,
                            { cache: 'no-store' }
                          )
                          const ok = res.ok ? await res.text() : ''
                          const excerpt = ok ? ok.split('\n').slice(0, 120).join('\n') : ''
                          setOverlay({
                            open: true,
                            title: f.path,
                            desc: f.description,
                            content: excerpt,
                          })
                        } catch {
                          setOverlay({ open: true, title: f.path, desc: f.description })
                        }
                      }}
                    >
                      {f.path}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Chapter content */}
          <article className="prose prose-emerald max-w-none rounded-2xl border border-emerald-200 bg-white/95 shadow p-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="m-0 text-xl font-semibold">{chapter?.title || active}</h2>
              {loading && <span className="text-emerald-800 text-sm">Loading…</span>}
              {error && <span className="text-rose-800 text-sm">{error}</span>}
            </div>

            {/* Description (horizontal on large screens) */}
            <div className="grid gap-6 lg:grid-cols-2 items-start">
              <section>
                <h3 className="text-lg font-semibold mb-1">Overview</h3>
                <p className="m-0 text-emerald-900/90 whitespace-pre-wrap">
                  {CHAPTER_CONTENT[active]?.overview || 'No overview available.'}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Key folders</h3>
                <ul className="m-0">
                  {(CHAPTER_CONTENT[active]?.keyFolders || []).map(k => (
                    <li key={k.name} className="mb-1">
                      <span className="font-medium">{k.name}</span>
                      <span className="text-emerald-900/80"> — {k.description}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Optional extra notes from chapter markdown (plain render) */}
            {markdown && (
              <section className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <pre className="whitespace-pre-wrap break-words bg-transparent text-emerald-900 text-[14px] leading-6">
                  {markdown}
                </pre>
              </section>
            )}

            {/* Diagrams under description */}
            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Diagrams</h3>
              {charts && charts.length > 0 ? (
                <MermaidRenderer charts={charts} mode="page" wheelZoom={false} />
              ) : (
                <div className="text-emerald-900/70 text-sm">
                  No diagrams available for this chapter.
                </div>
              )}
            </section>
          </article>
          {/* No separate right panel; diagrams are shown within article */}
        </div>
      </div>

      {/* Overlay for important files */}
      {overlay.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setOverlay({ open: false })}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative z-10 w-[min(92vw,800px)] max-h-[80vh] overflow-auto rounded-xl border border-emerald-300 bg-white p-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-emerald-900 break-all">
                  {overlay.title}
                </div>
                {overlay.desc && (
                  <div className="mt-1 text-emerald-900/80 text-sm">{overlay.desc}</div>
                )}
              </div>
              <button
                onClick={() => setOverlay({ open: false })}
                className="px-2 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-50"
                aria-label="Close"
              >
                Close
              </button>
            </div>
            {overlay.content && (
              <div className="mt-4">
                <div className="text-sm font-medium text-emerald-900 mb-1">Excerpt</div>
                <pre className="whitespace-pre-wrap break-words bg-emerald-50/60 border border-emerald-200 text-emerald-900 text-[12px] p-3 rounded">
                  {overlay.content}
                </pre>
              </div>
            )}
            <div className="mt-3 flex gap-2 text-sm">
              <a
                href={`/admin/diagrams/viewer/${encodeURIComponent(overlay.title || '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-50"
              >
                Open raw
              </a>
              <button
                className="px-2 py-1 rounded border border-emerald-300 text-emerald-900 hover:bg-emerald-50"
                onClick={() => navigator.clipboard.writeText(String(overlay.title || ''))}
              >
                Copy path
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
