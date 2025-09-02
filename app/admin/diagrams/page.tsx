'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

export default function DiagramsViewer() {
  const params = useSearchParams()
  const file = params.get('file') || ''
  const url = useMemo(() => (file ? `/diagrams/${file}` : ''), [file])

  useEffect(() => {
    // no-op: ensure client
  }, [])

  if (!file) return <div className="p-8">No diagram specified.</div>

  return (
    <div className="w-screen h-screen bg-neutral-900">
      <iframe
        src={`https://viewer.diagrams.net/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(url)}`}
        className="w-full h-full border-0"
      />
    </div>
  )
}
