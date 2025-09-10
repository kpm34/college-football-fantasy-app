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

          <article className="prose prose-amber max-w-none rounded-2xl border border-amber-200 bg-white/95 shadow p-6">
            <p className="text-sm text-amber-800 -mt-2 mb-6">
              A plain-English map of what each folder contributes and why it matters in this
              project.
            </p>

            <h2 id="dirs">Directory map (what each folder contributes)</h2>

            <h3 id="dir-app">
              <code>app/</code>
            </h3>
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
