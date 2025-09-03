'use client'

import { MermaidRenderer } from '@components/docs/MermaidRenderer'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function DraftDiagramPage({ params }: { params: Promise<{ file: string }> }) {
  const [file, setFile] = useState('')
  const [loading, setLoading] = useState(true)
  const [diagramContent, setDiagramContent] = useState<string | null>(null)
  const [useEmbedded, setUseEmbedded] = useState(true)

  useEffect(() => {
    params.then(p => {
      console.log('Loading diagram:', p.file)
      setFile(p.file)
      setLoading(false)

      // Also fetch the diagram content as backup
      if (p.file && p.file.endsWith('.drawio')) {
        fetch(`/docs/diagrams/draft-diagrams/${p.file}`)
          .then(res => res.text())
          .then(content => setDiagramContent(content))
          .catch(err => console.error('Failed to load diagram content:', err))
      }
    })
  }, [params])

  const url = useMemo(() => {
    if (!file) return ''
    // Serve directly from public folder - diagrams.net needs a publicly accessible URL
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return origin
      ? `${origin}/docs/diagrams/draft-diagrams/${file}`
      : `/docs/diagrams/draft-diagrams/${file}`
  }, [file])

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
        {!loading && !isMarkdown && url && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm text-amber-700">Loading from: {url}</div>
              {diagramContent && (
                <button
                  onClick={() => setUseEmbedded(!useEmbedded)}
                  className="px-3 py-1 text-sm rounded bg-amber-600 text-white hover:bg-amber-700"
                >
                  {useEmbedded ? 'Use Viewer' : 'Use Embedded'}
                </button>
              )}
            </div>

            {useEmbedded && diagramContent ? (
              // Embedded viewer with content
              <iframe
                key={`embedded-${file}`}
                srcDoc={`
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <style>body { margin: 0; overflow: hidden; }</style>
                  </head>
                  <body>
                    <div id="diagram" style="width:100%;height:100vh;"></div>
                    <script src="https://viewer.diagrams.net/js/viewer-static.min.js"></script>
                    <script>
                      const data = ${JSON.stringify(diagramContent)};
                      const viewer = new GraphViewer(document.getElementById('diagram'), data);
                      viewer.setEnabled(true);
                      viewer.showLightbox = true;
                    </script>
                  </body>
                  </html>
                `}
                className="w-full h-[80vh] border rounded bg-white"
                onLoad={() => console.log('Embedded viewer loaded for:', file)}
              />
            ) : (
              // External viewer with URL
              <iframe
                key={`viewer-${file}`}
                src={`https://viewer.diagrams.net/?lightbox=1&layers=1&nav=1&highlight=0000ff&url=${encodeURIComponent(url)}`}
                className="w-full h-[80vh] border rounded bg-white"
                onLoad={() => console.log('External viewer loaded for:', file)}
                onError={e => console.error('Viewer error for:', file, e)}
              />
            )}
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
