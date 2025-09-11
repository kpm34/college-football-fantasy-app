'use client'

import Link from 'next/link'

const items = [
  { slug: 'workflows:index', title: 'Overview' },
  { slug: 'workflows:production-process', title: 'Production Process' },
  { slug: 'workflows:incident-hotfix', title: 'Incident / Hotfix' },
  { slug: 'workflows:schema-migration', title: 'Schema / Data Migration' },
  { slug: 'workflows:analytics-instrumentation', title: 'Analytics Instrumentation' },
  { slug: 'workflows:design-handoff-integration', title: 'Design → Handoff → Code Integration' },
  { slug: 'workflows:campaign-launch', title: 'Campaign Launch' },
]

export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold font-bebas text-3d bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-sky-600 to-indigo-700 mb-4 tracking-wide">
          Workflows
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <a
              key={i.slug}
              href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
              className="px-4 py-3 rounded bg-emerald-700 text-white text-left shadow hover:bg-emerald-800"
            >
              <div className="font-semibold">{i.title}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
