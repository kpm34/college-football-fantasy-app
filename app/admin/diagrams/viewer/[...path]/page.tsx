'use client'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const Excalidraw = dynamic(() => import('@excalidraw/excalidraw').then(m => m.Excalidraw), {
  ssr: false,
  loading: () => <div className="p-4 text-amber-900">Loading Excalidraw…</div>,
}) as any

export default function UniversalDiagramViewerPage() {
  const params = useParams<{ path: string[] }>()
  const pathParts = Array.isArray(params?.path) ? params.path : []
  const relPath = decodeURIComponent(pathParts.join('/'))
  const fileUrl = `/api/docs/diagrams/${relPath}?bypass=1`
  const [text, setText] = useState<string>('')
  const [json, setJson] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const ext = useMemo(() => {
    const m = relPath.toLowerCase().match(/\.([a-z0-9]+)$/)
    return m?.[1] || ''
  }, [relPath])

  useEffect(() => {
    ;(async () => {
      try {
        if (ext === 'excalidraw') {
          const res = await fetch(fileUrl, { cache: 'no-store' })
          if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
          const t = await res.text()
          try {
            setJson(JSON.parse(t))
          } catch {
            setError('Invalid Excalidraw JSON')
          }
        } else if (ext === 'drawio' || ext === 'xml' || ext === 'mmd' || ext === 'md') {
          const res = await fetch(fileUrl, { cache: 'no-store' })
          if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
          const t = await res.text()
          setText(t)
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load file')
      }
    })()
  }, [fileUrl, ext])

  // Ensure <model-viewer> is available on the client when viewing 3D files
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!(ext === 'glb' || ext === 'gltf')) return
    const has = (window as any).customElements?.get('model-viewer')
    if (has) return
    const script = document.createElement('script')
    script.type = 'module'
    script.async = true
    script.src = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.3.0/dist/model-viewer.min.js'
    document.head.appendChild(script)
  }, [ext])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8ED' }}>
      <div className="mx-auto max-w-[1200px] p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-3 break-all">Viewer: {relPath}</h1>
        {error && <div className="mb-3 text-red-700">{error}</div>}
        {(ext === 'drawio' || ext === 'xml') && (
          <div className="w-full">
            <iframe
              title="drawio-viewer"
              className="w-full h-[80vh] rounded border"
              src={`https://viewer.diagrams.net/?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=${encodeURIComponent(relPath)}#R${encodeURIComponent(
                text
              )}`}
            />
            <div className="mt-2 flex gap-2 text-sm">
              <a
                href={`https://app.diagrams.net/?title=${encodeURIComponent(
                  relPath
                )}&libs=er;general;flowchart&url=${encodeURIComponent(fileUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-50"
              >
                Edit in draw.io
              </a>
              <span className="text-neutral-500">(No configuration needed; the editor loads from the URL above.)</span>
            </div>
          </div>
        )}
        {ext === 'excalidraw' && json && (
          <div className="w-full h-[80vh] rounded border overflow-hidden bg-white">
            <Excalidraw initialData={json} viewModeEnabled={true} detectScroll={false} />
          </div>
        )}
        {(ext === 'glb' || ext === 'gltf') && (
          // Use a div wrapper to satisfy TSX while we register the web component at runtime
          <div
            dangerouslySetInnerHTML={{
              __html: `<model-viewer src="${fileUrl}" ar auto-rotate camera-controls style="width:100%;height:80vh;background:#FFF8ED;border-radius:8px" exposure="1.0" shadow-intensity="1.0"></model-viewer>`,
            }}
          />
        )}
        {!(
          ext === 'drawio' ||
          ext === 'xml' ||
          ext === 'excalidraw' ||
          ext === 'glb' ||
          ext === 'gltf'
        ) && (
          <pre className="p-3 bg-white rounded border overflow-auto text-xs whitespace-pre-wrap">
            {text || 'No preview available for this type. You can still download via the API URL.'}
          </pre>
        )}
        <div className="mt-3 text-sm">
          <a href={fileUrl} className="underline text-sky-700" target="_blank" rel="noreferrer">
            Open raw file
          </a>
        </div>
      </div>
    </div>
  )
}
