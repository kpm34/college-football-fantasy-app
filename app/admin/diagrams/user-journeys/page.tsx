'use client'

const items = [
  { slug: 'user-journeys:auth-user-flow', title: 'Auth — User Journey' },
  { slug: 'user-journeys:leagues-user-flow', title: 'Leagues — User Journey' },
  { slug: 'user-journeys:draft-user-flow', title: 'Draft — User Journey' },
  { slug: 'user-journeys:projections-user-flow', title: 'Projections — User Journey' },
  { slug: 'user-journeys:scoring-user-flow', title: 'Scoring — User Journey' },
  { slug: 'user-journeys:realtime-user-flow', title: 'Realtime — User Journey' },
  { slug: 'user-journeys:ops-deploy-user-flow', title: 'Ops/Deploy — User Journey' },
]

export default function UserJourneysPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">User Journeys</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <a
              key={i.slug}
              href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
              className="px-4 py-3 rounded bg-sky-700 text-white text-left shadow hover:bg-sky-800"
            >
              <div className="font-semibold">{i.title}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
