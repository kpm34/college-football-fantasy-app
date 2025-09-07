'use client'

const items = [
  { slug: 'draft:user-flow:draft-user-flow', title: 'Draft User Flow' },
  { slug: 'draft:data-and-entity-relation:draft-entity-relation', title: 'Draft Entity Relation' },
  { slug: 'draft:api-routing:backend-apis', title: 'Draft Backend APIs' },
  { slug: 'draft:api-routing:frontend-apis', title: 'Draft Frontend APIs' },
  { slug: 'draft:api-routing:external-apis', title: 'Draft External APIs' },
  { slug: 'project-map:data-and-entity-relation:core-er', title: 'Core ER (Project Map)' },
]

export default function DraftDiagramsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Draft Diagrams</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <button
              key={i.slug}
              onClick={async () => {
                await fetch(`/api/docs/mermaid/${encodeURIComponent(i.slug)}`)
                window.dispatchEvent(new CustomEvent('open-mermaid', { detail: { slug: i.slug, title: i.title } }))
              }}
              className="px-4 py-3 rounded bg-amber-700 text-white text-left shadow hover:bg-amber-800"
            >
              <div className="font-semibold">{i.title}</div>
              <div className="text-xs opacity-80 truncate">{i.slug}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}


