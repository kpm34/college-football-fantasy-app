'use client'

import Link from 'next/link'

const items = [
  { slug: 'workflows:index', title: 'Overview' },
  { slug: 'workflows:ship-feature', title: 'Ship a Feature' },
  { slug: 'workflows:fix-prod-incident', title: 'Fix a Production Incident' },
  { slug: 'workflows:change-database-safely', title: 'Change the Database Safely' },
  { slug: 'workflows:track-events-correctly', title: 'Track Events Correctly' },
  { slug: 'workflows:design-to-code', title: 'Design to Code' },
  { slug: 'workflows:launch-campaign', title: 'Launch a Campaign' },
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
