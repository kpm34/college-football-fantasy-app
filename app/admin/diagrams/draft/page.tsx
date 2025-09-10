'use client'

const items = [
  { slug: 'draft:user-flow:draft-room-entry', title: 'Draft Room Entry' },
  { slug: 'draft:user-flow:league-creation-flow', title: 'League Creation Flow' },
  { slug: 'draft:user-flow:league-joining-flow', title: 'League Joining Flow' },
  { slug: 'draft:user-flow:mobile-draft-experience', title: 'Mobile Draft Experience' },
  { slug: 'draft:user-flow:player-selection-flow', title: 'Player Selection Flow' },
  { slug: 'draft:entity-relation:core-draft-entities', title: 'Core Draft Entities' },
  { slug: 'draft:entity-relation:league-team-entities', title: 'League & Team Entities' },
  { slug: 'draft:entity-relation:player-roster-entities', title: 'Player & Roster Entities' },
  { slug: 'draft:api-routing:backend-apis', title: 'Draft Backend APIs' },
  { slug: 'draft:api-routing:frontend-apis', title: 'Draft Frontend APIs' },
  { slug: 'draft:api-routing:external-apis', title: 'Draft External APIs' },
  { slug: 'draft:data-flow:draft-state-management', title: 'Draft State Management' },
  { slug: 'draft:data-flow:external-data-sources', title: 'External Data Sources' },
  { slug: 'draft:data-flow:projection-calculation', title: 'Projection Calculation' },
  { slug: 'draft:data-flow:real-time-updates', title: 'Real-time Updates' },
  { slug: 'project-map:data-and-entity-relation:core-er', title: 'Core ER (Project Map)' },
]

export default function DraftDiagramsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Draft Diagrams</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <a
              key={i.slug}
              href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
              className="px-4 py-3 rounded bg-amber-700 text-white text-left shadow hover:bg-amber-800"
            >
              <div className="font-semibold">{i.title}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
