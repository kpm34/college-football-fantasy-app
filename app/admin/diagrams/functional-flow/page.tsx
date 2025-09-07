'use client'

const items = [
  { slug: 'functional-flow:create-account', title: 'Create Account' },
  { slug: 'functional-flow:create-league', title: 'Create League' },
  { slug: 'functional-flow:join-league', title: 'Join League' },
]

export default function FunctionalFlowDiagramsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Functional Flow</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <a
              key={i.slug}
              href={`/admin?open=${encodeURIComponent(i.slug)}&title=${encodeURIComponent(i.title)}`}
              className="px-4 py-3 rounded bg-rose-600 text-white text-left shadow hover:bg-rose-700"
            >
              <div className="font-semibold">{i.title}</div>
              <div className="text-xs opacity-80 truncate">{i.slug}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}


