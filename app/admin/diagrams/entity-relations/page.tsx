'use client'

const items = [
  { slug: 'entity-relations:core-er', title: 'Core Entity Relations' },
  { slug: 'entity-relations:auth-entity-relation', title: 'Auth ER' },
  { slug: 'entity-relations:leagues-entity-relation', title: 'Leagues ER' },
  { slug: 'entity-relations:draft-entity-relation', title: 'Draft ER' },
  { slug: 'entity-relations:projections-entity-relation', title: 'Projections ER' },
  { slug: 'entity-relations:scoring-entity-relation', title: 'Scoring ER' },
  { slug: 'entity-relations:realtime-entity-relation', title: 'Realtime ER' },
  { slug: 'entity-relations:ops-deploy-entity-relation', title: 'Ops/Deploy ER' },
]

export default function EntityRelationsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Entity Relations</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <a
              key={i.slug}
              href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
              className="px-4 py-3 rounded bg-indigo-700 text-white text-left shadow hover:bg-indigo-800"
            >
              <div className="font-semibold">{i.title}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
