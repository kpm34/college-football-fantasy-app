'use client'

import Link from 'next/link'

export default function DiagramsHubPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Diagrams</h1>
          <a href="/api/lucid/authorize" className="rounded px-4 py-2 bg-black text-white text-sm">
            Connect Lucid
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Link href="/admin/diagrams/project-map" className="block rounded-lg p-4 bg-sky-700 text-white shadow">
            <div className="font-semibold">🗺️ Project Map</div>
            <div className="text-sm opacity-90">Overview · User Flow · Entity Relation · API/Events</div>
          </Link>
          <Link href="/admin/diagrams/system-architecture" className="block rounded-lg p-4 bg-indigo-700 text-white shadow">
            <div className="font-semibold">🏗️ System Architecture</div>
            <div className="text-sm opacity-90">Projections · Weight Tuning · Data Flow</div>
          </Link>
          <Link href="/admin/diagrams/functional-flow" className="block rounded-lg p-4 bg-rose-600 text-white shadow">
            <div className="font-semibold">⚡ Functional Flow</div>
            <div className="text-sm opacity-90">Create/Join League · Auth · Draft</div>
          </Link>
          <Link href="/admin/diagrams/draft" className="block rounded-lg p-4 bg-amber-700 text-white shadow">
            <div className="font-semibold">🏈 Draft</div>
            <div className="text-sm opacity-90">User Flow · Entity Relation · API Routing</div>
          </Link>
        </div>
      </div>
    </div>
  )
