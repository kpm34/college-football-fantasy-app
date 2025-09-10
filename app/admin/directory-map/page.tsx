import Link from 'next/link'

export default function DirectoryMapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-sky-600 to-indigo-600">
            Directory Map
          </h1>
          <Link href="/admin" className="text-sky-700 hover:text-sky-900 underline text-sm">
            Back to Admin
          </Link>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-200 bg-white/95 shadow-md mb-6">
          <div className="absolute -inset-x-10 -top-24 h-48 bg-gradient-to-r from-emerald-200/50 via-sky-200/50 to-indigo-200/50 blur-3xl" />
          <div className="relative p-6 md:p-7">
            <div className="text-amber-900 text-base md:text-lg">
              Understand how this repository is organized and which folders impact runtime bundles,
              DX, and deployment.
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs border border-emerald-300">
                Next.js App Router
              </span>
              <span className="px-2 py-1 rounded-full bg-sky-100 text-sky-800 text-xs border border-sky-300">
                Server Components first
              </span>
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs border border-indigo-300">
                Appwrite + Vercel
              </span>
              <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs border border-amber-300">
                Typed (TS + Zod)
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px,1fr] items-start">
          <aside className="hidden lg:block sticky top-20 self-start">
            <nav className="rounded-2xl border border-amber-200 bg-white/90 shadow p-4 text-sm text-amber-900">
              <div className="font-semibold text-amber-800 mb-2">On this page</div>
              <ul className="space-y-2">
                <li>
                  <a className="hover:text-amber-700" href="#dirs">
                    Directories
                  </a>
                  <ul className="mt-1 ml-3 space-y-1 text-amber-800/90">
                    <li>
                      <a className="hover:text-amber-700" href="#dir-app">
                        app/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-components">
                        components/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-lib">
                        lib/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-docs">
                        docs/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-functions">
                        functions/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-schema">
                        schema/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-scripts">
                        scripts/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-ops">
                        ops/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-data">
                        data/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-public">
                        public/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-styles">
                        styles/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-tests">
                        tests/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-future">
                        future/
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#dir-frontend">
                        frontend/
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a className="hover:text-amber-700" href="#top">
                    Top-level Files
                  </a>
                  <ul className="mt-1 ml-3 space-y-1 text-amber-800/90">
                    <li>
                      <a className="hover:text-amber-700" href="#file-middleware">
                        middleware.ts
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-instrumentation">
                        instrumentation.ts
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-next-config">
                        next.config.ts
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-postcss">
                        postcss.config.mjs
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-tailwind">
                        tailwind.config.js
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-tsconfig">
                        tsconfig.json
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-playwright">
                        playwright.config.ts
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-package">
                        package.json
                      </a>
                    </li>
                    <li>
                      <a className="hover:text-amber-700" href="#file-vercel">
                        vercel.json
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>
          </aside>

          <article className="prose prose-amber max-w-none rounded-2xl border border-amber-200 bg-white/95 shadow p-6 prose-headings:scroll-mt-28 prose-h3:flex prose-h3:items-center prose-h3:gap-2 prose-code:bg-amber-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-amber-900 prose-pre:!bg-stone-900 prose-pre:!text-amber-50 prose-hr:border-amber-200">
            <p className="text-sm text-amber-800 -mt-2 mb-6">
              A plain-English map of what each folder contributes and why it matters in this
              project.
            </p>

            <h2 id="dirs">Directory map (what each folder contributes)</h2>

            {/* Card grid view */}
            <div className="space-y-4">
              <section
                id="dir-app"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>app/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        Routes, layouts, server/client components, and route handlers (App Router).
                      </li>
                      <li>
                        Server Components by default; add <code>'use client'</code> only when
                        needed.
                      </li>
                      <li>Controls Edge/Node bundle count and sizes.</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>layout.tsx</code> – global layout and metadata
                      </li>
                      <li>
                        <code>globals.css</code> – Tailwind layers
                      </li>
                      <li>
                        <code>admin/page.tsx</code> – Admin dashboard
                      </li>
                      <li>
                        <code>api/*/route.ts</code> – API route handlers
                      </li>
                      <li>
                        <code>auth/callback/page.tsx</code> – OAuth callback
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Server-first
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                        App Router
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                        Edge/Node bundles
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-components"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>components/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Reusable UI building blocks and feature UIs.</li>
                      <li>
                        Server components by default; client-only with <code>'use client'</code>{' '}
                        sparingly.
                      </li>
                      <li>
                        Barrel exports via <code>components/index.ts</code>.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>components/docs/MermaidRenderer.tsx</code> – diagram renderer
                      </li>
                      <li>
                        <code>components/features/draft/*</code> – draft UI
                      </li>
                      <li>
                        <code>components/ui/*</code> – shadcn/ui wrappers
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Reusable
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                        Barrel exports
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        Client only (few)
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-lib"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>lib/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Business logic: repos, hooks, services, Appwrite clients, types.</li>
                      <li>
                        Split server-only vs client-safe; use <code>import 'server-only'</code> when
                        required.
                      </li>
                      <li>Draft logic, realtime, schema helpers.</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>lib/appwrite-server.ts</code> – privileged Appwrite client
                      </li>
                      <li>
                        <code>lib/hooks/*</code> – realtime and auth hooks
                      </li>
                      <li>
                        <code>lib/repos/*</code> – data access layer
                      </li>
                      <li>
                        <code>lib/draft-v2/engine.ts</code> – draft engine primitives
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                        Business logic
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                        Hooks & repos
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        server-only split
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-docs"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>docs/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Documentation, Mermaid diagrams, ADRs, guides, runbooks.</li>
                      <li>
                        Admin diagram pages render from <code>docs/diagrams</code>.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>docs/diagrams/project-map/*</code> – project maps
                      </li>
                      <li>
                        <code>docs/architecture-decision-records/*</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                        Mermaid
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Guides & ADRs
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-functions"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>functions/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Appwrite functions, workers, and cron wrappers.</li>
                      <li>
                        Convention: one folder per function with <code>index.ts</code>,{' '}
                        <code>local.ts</code>, fixture, README.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>functions/appwrite/*</code> – HTTP/webhook/trigger handlers
                      </li>
                      <li>
                        <code>functions/workers/*</code> – polling/ETL jobs
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Appwrite
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Cron/Workers
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-schema"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>schema/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>SSOT for Appwrite collections (Zod schemas, indexes, reports).</li>
                      <li>
                        Run <code>npm run generate:all</code> after changes.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>schema/zod-schema.ts</code>
                      </li>
                      <li>
                        <code>schema/indexes.ts</code>
                      </li>
                      <li>
                        <code>schema/schemas.registry.ts</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        SSOT
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                        Zod
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-ops"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>ops/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        Operational tooling, codemods, diagrams helpers. Legacy in{' '}
                        <code>ops/attic</code>.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>ops/diagrams/*</code> – generators
                      </li>
                      <li>
                        <code>ops/common/*</code> – shared scripts
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                        Ops
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Attic
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-data"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>data/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Static datasets for seeds, analysis, demos.</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>data/player/*.json</code>
                      </li>
                      <li>
                        <code>data/conference rosters/*.pdf</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                        Static
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Seeds
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-public"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>public/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        Static assets served at <code>/…</code> without bundling.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>public/docs/*</code> – static artifacts
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                        Static
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Optimize images
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-styles"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>styles/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Global CSS and Tailwind layers.</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>styles/mobile-draft-fixes.css</code> – targeted mobile tweaks
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Tailwind
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                        Global CSS
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-tests"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>tests/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Playwright E2E tests for admin diagrams and draft flows.</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>tests/e2e/admin-diagrams-smoke.spec.ts</code>
                      </li>
                      <li>
                        <code>tests/e2e/full-draft-flow.spec.ts</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                        Playwright
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                        Artifacts
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-future"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>future/</code>
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Exploratory ideas, prototypes, planning docs.</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        <code>future/scoring/*</code>, <code>future/auction-drafts/*</code>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                        Prototypes
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="dir-frontend"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>frontend/</code> (legacy)
                </h3>
                <div className="grid gap-4">
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Description</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>
                        Legacy scaffold preserved for reference; new work lives in root{' '}
                        <code>app/</code>.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Notable files</div>
                    <ul className="text-sm text-amber-900/90 list-disc pl-5 space-y-1">
                      <li>Minimal placeholder app</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-900 mb-1">Labels</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                        Legacy
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <h3 id="dir-app">
              <code>app/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Server-first
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                App Router
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                Edge/Node bundles
              </span>
            </div>
            <ul>
              <li>Routes, layouts, server/client components, and route handlers (App Router).</li>
              <li>
                Server Components by default; add <code>'use client'</code> only where interactivity
                is required.
              </li>
              <li>Controls how many serverless/edge bundles are produced and their sizes.</li>
              <li>
                Tip: co-locate data fetching in server components; use <code>next/dynamic</code> for
                heavy client-only widgets (charts, 3D, editors).
              </li>
              <li>
                Structure used here: <code>(dashboard)</code>, <code>(league)</code>,{' '}
                <code>admin/</code>, <code>api/</code>, <code>auth/callback</code>,{' '}
                <code>client-brief/</code>, <code>draft/</code>, <code>scoreboard/</code>,{' '}
                <code>standings/</code>.
              </li>
              <li>
                Admin includes diagram hubs and tools; diagram pages render Mermaid from{' '}
                <code>docs/diagrams</code>.
              </li>
            </ul>

            <h3 id="dir-components">
              <code>components/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Reusable
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
                Barrel exports
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                Client only (sparingly)
              </span>
            </div>
            <ul>
              <li>Reusable UI building blocks and feature components.</li>
              <li>
                Only imported files are bundled. Keep most components server by default; mark
                client-only pieces with <code>'use client'</code> sparingly.
              </li>
              <li>
                Barrel exports in <code>components/index.ts</code> for clean imports.
              </li>
              <li>
                Notable subfolders: <code>features/</code>, <code>ui/</code>, <code>docs/</code>,{' '}
                <code>dev/</code>, <code>layout/</code>, <code>tables/</code>, <code>charts/</code>.
              </li>
            </ul>

            <h3 id="dir-lib">
              <code>lib/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                Business logic
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                Hooks & repos
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                server-only split
              </span>
            </div>
            <ul>
              <li>Shared utilities, repositories, hooks, services, Appwrite clients, and types.</li>
              <li>
                Split server-only vs client-safe modules. If a module imports <code>fs</code>, DB
                SDKs, or secrets, add <code>import 'server-only'</code> to keep it out of client
                bundles.
              </li>
              <li>Includes domain logic for draft, realtime, and data sync.</li>
              <li>
                Subfolders present: <code>api/</code>, <code>clients/</code>, <code>config/</code>,{' '}
                <code>data-sync/</code>, <code>db/</code>, <code>domain/</code>,{' '}
                <code>draft-v2/</code>, <code>generated/</code>, <code>hooks/</code>,{' '}
                <code>middleware/</code>, <code>realtime/</code>, <code>repos/</code>,{' '}
                <code>services/</code>, <code>theme/</code>, <code>types/</code>,{' '}
                <code>utils/</code>, plus files like <code>openai.ts</code>, <code>power4.ts</code>,{' '}
                <code>runway.ts</code>.
              </li>
            </ul>

            <h3 id="dir-docs">
              <code>docs/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                Mermaid
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Guides & ADRs
              </span>
            </div>
            <ul>
              <li>
                Project documentation, diagrams (Mermaid markdown), guides, ADRs, and runbooks.
              </li>
              <li>
                Diagram pages under Admin render directly from files in <code>docs/diagrams</code>.
              </li>
              <li>
                Also contains API examples, inspiration, and guardrails; used as the source for
                Admin diagrams.
              </li>
            </ul>

            <h3 id="dir-functions">
              <code>functions/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Appwrite
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Cron/Workers
              </span>
            </div>
            <ul>
              <li>Appwrite functions, workers, and cron wrappers.</li>
              <li>
                Convention: one folder per function in{' '}
                <code>functions/appwrite/&lt;kebab-name&gt;</code> with <code>index.ts</code>,{' '}
                <code>local.ts</code>, fixture, and README.
              </li>
              <li>
                Subfolders: <code>appwrite/</code>, <code>cron/</code>, <code>workers/</code>.
              </li>
            </ul>

            <h3 id="dir-schema">
              <code>schema/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                SSOT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                Zod
              </span>
            </div>
            <ul>
              <li>
                Single Source of Truth (SSOT) for Appwrite collections (Zod schemas, indexes,
                reports).
              </li>
              <li>
                Run <code>npm run generate:all</code> after schema changes; keep{' '}
                <code>zod-schema.ts</code> authoritative.
              </li>
              <li>
                Key files: <code>zod-schema.ts</code>, <code>indexes.ts</code>,{' '}
                <code>schemas.registry.ts</code>, <code>sdk-appwrite-schema.json</code>, report
                markdown.
              </li>
            </ul>

            <h3 id="dir-scripts">
              <code>scripts/</code>
            </h3>
            <ul>
              <li>
                Utility scripts for sync, exports, and one-off tasks (TypeScript, run with{' '}
                <code>tsx</code>).
              </li>
            </ul>

            <h3 id="dir-ops">
              <code>ops/</code>
            </h3>
            <ul>
              <li>
                Operational tooling, codemods, and playbooks. Legacy pages moved to{' '}
                <code>ops/attic</code>.
              </li>
              <li>
                Includes <code>ops/common/</code> utilities and <code>ops/diagrams/</code> helpers.
              </li>
            </ul>

            <h3 id="dir-data">
              <code>data/</code>
            </h3>
            <ul>
              <li>Static datasets, CSVs, and JSON used for seeds, analysis, or demos.</li>
              <li>Contains conference roster PDFs, market data, player JSON, and team maps.</li>
            </ul>

            <h3 id="dir-public">
              <code>public/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                Static
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                Optimize images
              </span>
            </div>
            <ul>
              <li>
                Static assets served at <code>/…</code> without bundling.
              </li>
              <li>
                Optimize images; prefer <code>next/image</code> for UI rasters. Keep 3D/mascot
                assets compressed.
              </li>
              <li>
                Includes a <code>public/docs</code> mirror for some static artifacts.
              </li>
            </ul>

            <h3 id="dir-styles">
              <code>styles/</code>
            </h3>
            <ul>
              <li>
                Global CSS and Tailwind layers (project also uses <code>app/globals.css</code>).
              </li>
              <li>Keep Tailwind content globs tight to speed builds.</li>
              <li>
                <code>styles/mobile-draft-fixes.css</code> contains targeted mobile draft UI tweaks.
              </li>
            </ul>

            <h3 id="dir-tests">
              <code>tests/</code>
            </h3>
            <div className="mt-2 mb-3 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                Playwright
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                Artifacts
              </span>
            </div>
            <ul>
              <li>Playwright E2E tests for admin diagrams and draft flows.</li>
              <li>
                Outputs under <code>test-results/</code> with videos and screenshots for failures.
              </li>
            </ul>

            <h3 id="dir-future">
              <code>future/</code>
            </h3>
            <ul>
              <li>
                Exploratory ideas, prototypes, and planning docs kept out of the main runtime.
              </li>
            </ul>

            <h3 id="dir-frontend">
              <code>frontend/</code> (legacy)
            </h3>
            <ul>
              <li>
                Old scaffold preserved for reference. New work lives in the root <code>app/</code>{' '}
                directory.
              </li>
            </ul>

            <hr />
            <h2 id="top">Top-level files (what they do and why they matter)</h2>

            <div className="space-y-4">
              <section
                id="file-middleware"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>middleware.ts</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  Edge Middleware runs before matched requests. Use it for lightweight auth checks,
                  rewrites, and headers. Scope matcher tightly to avoid disabling static
                  optimization.
                </p>
                <pre className="!mt-2 !mb-3">
                  <code>{`export const config = {\n  matcher: ['/dashboard/:path*', '/league/:path*']\n}`}</code>
                </pre>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                    Edge
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                    No heavy deps
                  </span>
                </div>
              </section>

              <section
                id="file-instrumentation"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>instrumentation.ts</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  OpenTelemetry entrypoint for tracing/metrics. Initialize providers and exporters
                  here; great for measuring API latency in draft and scoring flows.
                </p>
                <pre className="!mt-2 !mb-3">
                  <code>{`export async function register() {\n  // init tracing/metrics providers\n}`}</code>
                </pre>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Observability
                  </span>
                </div>
              </section>

              <section
                id="file-next-config"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>next.config.ts</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  Framework configuration: images domains, redirects/rewrites/headers, experimental
                  flags, and bundle analysis toggles. Prefer centralizing redirects/headers here
                  over <code>vercel.json</code>.
                </p>
              </section>

              <section
                id="file-postcss"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>postcss.config.mjs</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  Tailwind + Autoprefixer pipeline. Minimal and rarely the bottleneck.
                </p>
              </section>

              <section
                id="file-tailwind"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>tailwind.config.js</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  Controls content scanning (keep globs tight) and design tokens. Use safelist
                  sparingly.
                </p>
              </section>

              <section
                id="file-tsconfig"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>tsconfig.json</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  TypeScript options + path aliases (e.g., <code>@/components</code>). Impacts
                  developer experience and import hygiene.
                </p>
              </section>

              <section
                id="file-playwright"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>playwright.config.ts</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  Controls E2E runs (browsers, timeouts, baseURL). Artifacts saved under{' '}
                  <code>test-results/</code>.
                </p>
              </section>

              <section
                id="file-package"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>package.json</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  Dependencies and scripts. Major indirect impact on bundle size: avoid heavy
                  client-only libraries in server components; lazy-load charts/maps/3D.
                </p>
              </section>

              <section
                id="file-vercel"
                className="rounded-2xl border border-amber-200 bg-white/95 shadow p-5"
              >
                <h3 className="text-lg font-semibold mb-2">
                  <code>vercel.json</code>
                </h3>
                <p className="text-sm text-amber-900/90 mb-2">
                  Platform-specific overrides: regions, routes, and headers. Avoid duplicating
                  what's in <code>next.config.ts</code>; use only when necessary for platform
                  behavior.
                </p>
              </section>
            </div>

            <h3 id="file-middleware">
              <code>middleware.ts</code>
            </h3>
            <p>
              Edge Middleware that runs before matched requests (auth, A/B, geolocation, rewrites).
              Scope the matcher tightly to avoid disabling static optimization.
            </p>
            <pre className="!mt-2 !mb-4">
              <code>{`export const config = {\n  matcher: ['/dashboard/:path*', '/league/:path*']\n}`}</code>
            </pre>
            <ul>
              <li>Keep it tiny—no heavy dependencies.</li>
            </ul>

            <h3 id="file-instrumentation">
              <code>instrumentation.ts</code>
            </h3>
            <p>
              Next.js OpenTelemetry entrypoint for tracing/metrics (e.g., draft and live scoring
              latency).
            </p>
            <pre className="!mt-2 !mb-4">
              <code>{`export async function register() {\n  // init tracing/metrics providers\n}`}</code>
            </pre>

            <h3 id="file-next-config">
              <code>next.config.ts</code>
            </h3>
            <ul>
              <li>
                Framework config: images domains, redirects/rewrites/headers, experimental flags,
                bundle analysis.
              </li>
              <li>
                Prefer redirects/headers here over <code>vercel.json</code> to keep config
                centralized.
              </li>
            </ul>

            <h3 id="file-postcss">
              <code>postcss.config.mjs</code>
            </h3>
            <p>Pipeline for Tailwind + Autoprefixer; typically minimal.</p>

            <h3 id="file-tailwind">
              <code>tailwind.config.js</code>
            </h3>
            <p>
              Controls content scanning and design tokens. Keep <code>content</code> globs tight.
            </p>

            <h3 id="file-tsconfig">
              <code>tsconfig.json</code>
            </h3>
            <p>
              TypeScript options + path aliases (e.g., <code>@/components</code>). Impacts DX and
              import hygiene.
            </p>

            <h3 id="file-playwright">
              <code>playwright.config.ts</code>
            </h3>
            <p>
              Controls E2E runs, browser config, and test timeouts; outputs saved in{' '}
              <code>test-results/</code>.
            </p>

            <h3 id="file-package">
              <code>package.json</code>
            </h3>
            <ul>
              <li>
                Dependencies and scripts. Indirectly affects bundle size—avoid heavy client libs in
                server components; lazy-load charts/maps/3D.
              </li>
            </ul>

            <h3 id="file-vercel">
              <code>vercel.json</code>
            </h3>
            <p>
              Vercel platform overrides (regions, routes, headers). Avoid duplication with{' '}
              <code>next.config.ts</code>.
            </p>
          </article>
        </div>
      </div>
    </div>
  )
}
