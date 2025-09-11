'use client'

<<<<<<< HEAD
const items = [
  { slug: 'workflows:index', title: 'Overview' },
  { slug: 'workflows:ship-feature', title: 'Ship a Feature' },
  { slug: 'workflows:fix-prod-incident', title: 'Fix a Production Incident' },
  { slug: 'workflows:change-database-safely', title: 'Change the Database Safely' },
  { slug: 'workflows:track-events-correctly', title: 'Track Events Correctly' },
  { slug: 'workflows:design-to-code', title: 'Design to Code' },
  { slug: 'workflows:design-3d-animations', title: 'Design 3D & Animations' },
  { slug: 'workflows:launch-campaign', title: 'Launch a Campaign' },
=======
import Link from 'next/link'

const items = [
  { slug: 'workflows:index', title: 'Overview' },
  { slug: 'workflows:production-process', title: 'Production Process' },
  { slug: 'workflows:incident-hotfix', title: 'Incident / Hotfix' },
  { slug: 'workflows:schema-migration', title: 'Schema / Data Migration' },
  { slug: 'workflows:analytics-instrumentation', title: 'Analytics Instrumentation' },
  { slug: 'workflows:design-handoff-integration', title: 'Design → Handoff → Code Integration' },
  { slug: 'workflows:campaign-launch', title: 'Campaign Launch' },
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
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
<<<<<<< HEAD
            <div key={i.slug} className="flex items-center gap-2">
              <a
                href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
                className="flex-1 px-4 py-3 rounded bg-emerald-700 text-white text-left shadow hover:bg-emerald-800"
              >
                <div className="font-semibold">{i.title}</div>
              </a>
              <a
                href={`/admin/diagrams/viewer/docs/guides/workflows/${encodeURIComponent(
                  i.slug.split(':')[1]
                )}.md`}
                className="px-3 py-2 rounded border border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-50 text-sm"
              >
                Guide
              </a>
            </div>
=======
            <a
              key={i.slug}
              href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
              className="px-4 py-3 rounded bg-emerald-700 text-white text-left shadow hover:bg-emerald-800"
            >
              <div className="font-semibold">{i.title}</div>
            </a>
>>>>>>> 24f9fd624f579848150ad3605557a38310d191b4
          ))}
        </div>
      </div>
    </div>
  )
}
