'use client'

import { useEffect, useRef } from 'react'

// Tiny, dependency-free GLB viewer using <model-viewer> web component if available
// Falls back to iframe-based viewer if not present.

export function GLTFViewer({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const hasModelViewer = typeof window !== 'undefined' && !!customElements.get('model-viewer')
    if (hasModelViewer) {
      el.innerHTML = `<model-viewer src="${url}" style="width:100%;height:100%;background:transparent" camera-controls interaction-prompt="none" disable-zoom autoplay exposure="1.0" shadow-intensity="0.5"></model-viewer>`
      return
    }
    // Fallback simple iframe (could be a hosted generic viewer)
    el.innerHTML = `<iframe src="/api/blender/file/${encodeURIComponent(url)}" style="width:100%;height:100%;border:0;background:transparent"></iframe>`
  }, [url])

  return <div ref={ref} className="w-full h-full" />
}


