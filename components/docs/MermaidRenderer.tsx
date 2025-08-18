'use client'

import { useEffect, useRef } from 'react'

interface MermaidRendererProps {
  charts: string[]
}

export function MermaidRenderer({ charts }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    const disposers: Array<() => void> = []

    const setupPanZoom = (host: HTMLElement) => {
      const svg = host.querySelector('svg') as SVGSVGElement | null
      if (!svg) return () => {}
      let isDragging = false
      let lastX = 0
      let lastY = 0
      let translateX = 0
      let translateY = 0
      let scale = 1

      const applyTransform = () => {
        svg.style.transformOrigin = '0 0'
        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
      }

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return
        isDragging = true
        lastX = e.clientX
        lastY = e.clientY
        host.setPointerCapture(e.pointerId)
        svg.style.cursor = 'grabbing'
      }
      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        lastX = e.clientX
        lastY = e.clientY
        translateX += dx
        translateY += dy
        applyTransform()
      }
      const onPointerUp = (e: PointerEvent) => {
        isDragging = false
        try { host.releasePointerCapture(e.pointerId) } catch {}
        svg.style.cursor = 'grab'
      }
      const onWheel = (e: WheelEvent) => {
        e.preventDefault()
        const delta = -e.deltaY
        const factor = delta > 0 ? 1.1 : 0.9
        const next = Math.min(4, Math.max(0.4, scale * factor))
        // Zoom towards cursor roughly
        const rect = host.getBoundingClientRect()
        const ox = (e.clientX - rect.left - translateX) / scale
        const oy = (e.clientY - rect.top - translateY) / scale
        translateX -= ox * (next - scale)
        translateY -= oy * (next - scale)
        scale = next
        applyTransform()
      }
      const onDblClick = () => {
        // Reset
        translateX = 0
        translateY = 0
        scale = 1
        applyTransform()
      }

      svg.style.cursor = 'grab'
      ;(host.style as any).touchAction = 'none'
      host.addEventListener('pointerdown', onPointerDown)
      host.addEventListener('pointermove', onPointerMove)
      host.addEventListener('pointerup', onPointerUp)
      host.addEventListener('pointercancel', onPointerUp)
      host.addEventListener('wheel', onWheel, { passive: false })
      host.addEventListener('dblclick', onDblClick)
      applyTransform()

      return () => {
        host.removeEventListener('pointerdown', onPointerDown)
        host.removeEventListener('pointermove', onPointerMove)
        host.removeEventListener('pointerup', onPointerUp)
        host.removeEventListener('pointercancel', onPointerUp)
        host.removeEventListener('wheel', onWheel as any)
        host.removeEventListener('dblclick', onDblClick)
      }
    }
    const renderAll = async () => {
      if (!containerRef.current) return
      try {
        const { default: mermaid } = await import('mermaid')
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'dark',
          flowchart: { htmlLabels: true },
          themeVariables: {
            background: '#1f2937', // gray-800 (lighter than pure black for readability)
            primaryTextColor: '#e5e7eb', // gray-200
            secondaryTextColor: '#d1d5db', // gray-300
            lineColor: '#9ca3af', // gray-400
            nodeBorder: '#e5e7eb',
            fontSize: '12px'
          }
        })
        if (!isMounted || !containerRef.current) return
        const nodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-mermaid]'))
        for (const [index, el] of nodes.entries()) {
          const raw = el.getAttribute('data-mermaid-code') || ''
          // Light sanitization: escape characters that commonly break parsing in labels
          const code = raw
            .replaceAll('|', '&#124;')
            .replaceAll('&', '&amp;')
          try {
            const { svg } = await mermaid.render(`mermaid-${index}-${Date.now()}`, code)
            // Wrap in a pan/zoom host for interactivity
            el.innerHTML = `<div class="pz-host">${svg}</div>`
            const host = el.querySelector('.pz-host') as HTMLElement | null
            if (host) {
              host.style.display = 'block'
              host.style.overflow = 'hidden'
              host.style.background = '#1f2937' // gray-800 for better contrast vs text
              host.style.borderRadius = '0.5rem'
              host.style.padding = '0.5rem'
              const dispose = setupPanZoom(host)
              disposers.push(dispose)
            }
          } catch (error) {
            console.error('Mermaid render failed:', error)
            // Do not show raw code; present a compact error placeholder instead
            const message = (error as any)?.message ? String((error as any).message).slice(0, 140) : 'Unknown error'
            el.innerHTML = `<div style="padding:0.75rem;border:1px dashed rgba(255,255,255,0.2);border-radius:0.5rem;color:#d1d5db;background:#111827">Diagram failed to render. ${message}</div>`
          }
        }
      } catch (error) {
        console.error('Failed to load Mermaid:', error)
      }
    }

    renderAll()

    return () => {
      isMounted = false
      disposers.forEach((d) => {
        try { d() } catch {}
      })
    }
  }, [charts])

  return (
    <div ref={containerRef} className="space-y-8 text-sm leading-6">
      {charts.map((code, idx) => (
        <div key={idx} data-mermaid data-mermaid-code={code} />
      ))}
    </div>
  )
}


