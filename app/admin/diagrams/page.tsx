'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'

function DiagramsContent() {
  const params = useSearchParams()
  const file = params.get('file') || ''
  const url = useMemo(() => {
    if (!file) return ''
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    // Ensure absolute URL so viewer.diagrams.net can fetch via CORS
    return origin ? `${origin}/diagrams/${file}` : `/diagrams/${file}`
  }, [file])

  useEffect(() => {
    // no-op: ensure client
  }, [])

  if (!file) return <div className="p-8">No diagram specified.</div>

  return (
    <iframe
      src={`https://viewer.diagrams.net/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(url)}`}
      className="w-full h-full border-0"
    />
  )
}

export default function DiagramsViewerPage() {
  return (
    <div className="w-screen h-screen bg-neutral-900">
      <Suspense fallback={<div className="p-8 text-neutral-100">Loading…</div>}>
        <DiagramsContent />
      </Suspense>
    </div>
  )
}
