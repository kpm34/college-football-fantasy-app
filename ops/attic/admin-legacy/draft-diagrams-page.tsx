'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DiagramItem {
  file: string
  title: string
  group: 'Flows' | 'Operations' | 'Endpoints' | 'Timing'
}

export default function DraftDiagramsPage() {
  const [items, setItems] = useState<DiagramItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetch('/api/docs/diagrams/draft/list')
      .then(r => r.json())
      .then(data => {
        setItems((data?.items || []) as DiagramItem[])
        setLoading(false)
      })
      .catch((e: any) => {
        setError(e?.message || 'Failed to load diagrams')
        setLoading(false)
      })
  }, [])

  const groups: Array<DiagramItem['group']> = ['Flows', 'Timing', 'Endpoints', 'Operations']

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/admin" className="text-amber-600 hover:text-amber-700">
          ← Back to Admin
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Draft System</h1>
      {loading ? (
        <div className="text-gray-700">Loading diagrams…</div>
      ) : error ? (
        <div className="text-red-700">{error}</div>
      ) : (
        <div className="space-y-8">
          {groups.map(group => {
            const groupItems = items.filter(i => i.group === group)
            if (groupItems.length === 0) return null
            return (
              <div key={group}>
                <h2 className="text-xl font-semibold mb-3 text-gray-800">{group}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupItems.map(item => (
                    <a
                      key={item.file}
                      href={`/admin/diagrams?file=${encodeURIComponent(item.file)}`}
                      className="bg-white rounded-lg shadow-lg p-6 block hover:shadow-xl transition-shadow duration-200 border border-gray-200 text-left"
                    >
                      <h3 className="text-lg font-semibold mb-2 text-gray-800">{item.title}</h3>
                      <p className="text-gray-600 text-xs break-all">{item.file}</p>
                    </a>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
