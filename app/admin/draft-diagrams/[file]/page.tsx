'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function DraftDiagramPage({ params }: { params: Promise<{ file: string }> }) {
  const [file, setFile] = useState('')
  const [loading, setLoading] = useState(true)
  const [diagramContent, setDiagramContent] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => {
      console.log('Loading diagram:', p.file)
      setFile(p.file)

      // Always fetch the diagram content to use data URL approach
      if (p.file && p.file.endsWith('.drawio')) {
        setLoading(true)
        fetch(`/api/diagrams/${p.file}`)
          .then(res => res.text())
          .then(content => {
            console.log('Fetched diagram content, length:', content.length)
            setDiagramContent(content)
            setLoading(false)
          })
          .catch(err => {
            console.error('Failed to load diagram content:', err)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [params])

  const isMarkdown = useMemo(() => file.toLowerCase().endsWith('.md'), [file])
  const [charts, setCharts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isMarkdown || !file) return
    const base = file.replace(/\.(md)$/i, '')
    // Map md files under draft-diagrams to slug pattern draft:<basename>
    const slug = `draft:${base}`
    fetch(`/api/docs/mermaid/${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then(async r => {
        const j = await r.json()
        if (!r.ok) throw new Error(j?.error || 'Failed to load diagram')
        setCharts(Array.isArray(j.charts) ? j.charts : [])
      })
      .catch(e => setError(e?.message || 'Failed to load diagram'))
  }, [isMarkdown, file])

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #FAEEE1 0%, #FFF8ED 40%, #F2E5D5 100%)' }}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color: '#5B2E0F' }}>
              {file ? file.replace(/\.(drawio|md)$/i, '').replace(/[-_]/g, ' ') : 'Diagram'}
            </h1>
            {file && <p className="text-sm text-amber-700 mt-1">File: {file}</p>}
          </div>
          <Link
            href="/admin/draft-diagrams"
            className="px-3 py-2 rounded bg-amber-700 text-white hover:bg-amber-800"
          >
            Back
          </Link>
        </div>

        {loading && (
          <div className="bg-white/90 rounded-xl p-8 shadow border border-amber-200 text-center">
            <div className="text-amber-800">Loading diagram...</div>
          </div>
        )}

        {/* Render .drawio in viewer, .md via MermaidRenderer */}
        {!loading && !isMarkdown && diagramContent && (
          <div>
            <iframe
              key={`diagram-${file}`}
              src={`https://viewer.diagrams.net/?lightbox=1&layers=1&nav=1#R${encodeURIComponent(diagramContent)}`}
              className="w-full h-[80vh] border rounded bg-white"
              onLoad={() => console.log('Diagram viewer loaded for:', file)}
              onError={e => console.error('Viewer error for:', file, e)}
            />
          </div>
        )}
        {isMarkdown && (
          <div className="bg-white/90 rounded-xl p-4 shadow border border-amber-200">
            {error ? (
              <div className="text-rose-700">{error}</div>
            ) : (
              <MermaidRenderer charts={charts} mode="page" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
