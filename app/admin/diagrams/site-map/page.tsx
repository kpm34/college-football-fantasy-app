'use client'

const items = [
  { slug: 'sitemap:web:active', title: 'Site Map — Web (Active)' },
  { slug: 'sitemap:mobile:active', title: 'Site Map — Mobile (Active)' },
  { slug: 'sitemap:web:final', title: 'Site Map — Web (Final)' },
  { slug: 'sitemap:mobile:final', title: 'Site Map — Mobile (Final)' },
]

export default function SiteMapDiagramsPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-bold mb-4">Site Map</h1>
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
