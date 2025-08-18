'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidRendererProps {
  charts: string[]
}

export function MermaidRenderer({ charts }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default' })

    if (!containerRef.current) return

    const renderAll = async () => {
      if (!containerRef.current) return
      const nodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-mermaid]'))
      for (const [index, el] of nodes.entries()) {
        const code = el.getAttribute('data-mermaid-code') || ''
        try {
          const { svg } = await mermaid.render(`mermaid-${index}-${Date.now()}`, code)
          el.innerHTML = svg
        } catch (error) {
          console.error('Mermaid render failed:', error)
          el.innerHTML = `<pre style="white-space:pre-wrap;word-break:break-word;">${code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</pre>`
        }
      }
    }

    renderAll()
  }, [charts])

  return (
    <div ref={containerRef} className="space-y-8">
      {charts.map((code, idx) => (
        <div key={idx} data-mermaid data-mermaid-code={code} />
      ))}
    </div>
  )
}


