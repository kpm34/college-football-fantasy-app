'use client'

import Link from 'next/link'

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
        <h1 className="text-3xl md:text-4xl font-extrabold font-bebas text-3d bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-sky-600 to-indigo-700 mb-4 tracking-wide">
          Site Map
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map(i => (
            <Link
              key={i.slug}
              href={`/admin/diagrams/${encodeURIComponent(i.slug)}`}
              className="px-4 py-3 rounded bg-emerald-700 text-white text-left shadow hover:bg-emerald-800"
            >
              <div className="font-semibold">{i.title}</div>
            </Link>
          ))}
          <Link
            href="/admin/diagrams/site-map/final-table/"
            className="px-4 py-3 rounded bg-emerald-900 text-white text-left shadow hover:bg-emerald-950"
            title="Open interactive Final Version table"
          >
            <div className="font-semibold">Final Version Table</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
