'use client'

const items = [
  { slug: 'system-architecture:projections-overview', title: 'Projections Overview' },
  { slug: 'system-architecture:yearly-projections', title: 'Yearly Projections' },
  { slug: 'system-architecture:weekly-projections', title: 'Weekly Projections' },
  { slug: 'system-architecture:weight-tuning', title: 'Weight Tuning' },
]

export default function SystemArchitectureDiagramsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">System Architecture</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <button
              key={i.slug}
              onClick={async () => {
                await fetch(`/api/docs/mermaid/${encodeURIComponent(i.slug)}`)
                window.dispatchEvent(new CustomEvent('open-mermaid', { detail: { slug: i.slug, title: i.title } }))
              }}
              className="px-4 py-3 rounded bg-indigo-700 text-white text-left shadow hover:bg-indigo-800"
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


