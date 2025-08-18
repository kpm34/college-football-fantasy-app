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
      if (!svg) return { dispose: () => {}, setScaleRelative: (_f: number) => {}, reset: () => {}, getScale: () => 1 }
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

      // Initialize from any existing transform set by initial fit
      const existing = svg.style.transform
      if (existing) {
        const trMatch = existing.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/)
        const scMatch = existing.match(/scale\(([-\d.]+)\)/)
        if (trMatch) {
          translateX = parseFloat(trMatch[1]) || 0
          translateY = parseFloat(trMatch[2]) || 0
        }
        if (scMatch) {
          const s = parseFloat(scMatch[1])
          if (!Number.isNaN(s) && s > 0) scale = s
        }
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

      const dispose = () => {
        host.removeEventListener('pointerdown', onPointerDown)
        host.removeEventListener('pointermove', onPointerMove)
        host.removeEventListener('pointerup', onPointerUp)
        host.removeEventListener('pointercancel', onPointerUp)
        host.removeEventListener('wheel', onWheel as any)
        host.removeEventListener('dblclick', onDblClick)
      }

      const setScaleRelative = (factor: number) => {
        const next = Math.max(0.4, Math.min(4, scale * factor))
        scale = next
        applyTransform()
      }

      const reset = () => {
        translateX = 0
        translateY = 0
        scale = 1
        applyTransform()
      }

      const getScale = () => scale

      return { dispose, setScaleRelative, reset, getScale }
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
            background: '#111827',
            primaryTextColor: '#f3f4f6',
            secondaryTextColor: '#e5e7eb',
            lineColor: '#9ca3af',
            nodeBorder: '#e5e7eb',
            fontSize: '20px'
          }
        })
        if (!isMounted || !containerRef.current) return
        const nodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-mermaid]'))
        for (const [index, el] of nodes.entries()) {
          const raw = el.getAttribute('data-mermaid-code') || ''
          // Light sanitization: escape characters that commonly break parsing in labels
          const code = raw.replaceAll('&', '&amp;')
          try {
            const { svg } = await mermaid.render(`mermaid-${index}-${Date.now()}`, code)
            // Wrap in a pan/zoom host for interactivity
            el.innerHTML = `<div class="pz-host">${svg}</div>`
            const host = el.querySelector('.pz-host') as HTMLElement | null
            if (host) {
              host.style.display = 'block'
              host.style.overflow = 'hidden'
              host.style.background = '#111827'
              host.style.borderRadius = '0.5rem'
              host.style.padding = '0.5rem'

              // Fit-to-width once the SVG is in the DOM and keep responsive
              const svgEl = host.querySelector('svg') as SVGSVGElement | null
              if (svgEl) {
                const fit = () => {
                  const vb = svgEl.viewBox.baseVal
                  if (!vb || vb.width === 0) return
                  const cw = host.clientWidth
                  const scale = Math.max(0.6, Math.min(2.5, cw / vb.width))
                  svgEl.style.transformOrigin = '0 0'
                  svgEl.style.transform = `translate(0px, 0px) scale(${scale})`
                }
                fit()
                const ro = new ResizeObserver(() => fit())
                ro.observe(host)
                disposers.push(() => ro.disconnect())
              }

              // Initialize pan/zoom controller after initial fit to preserve scale
              const controller = setupPanZoom(host)
              disposers.push(controller.dispose)

              // Toolbar overlay for zoom controls and save
              const toolbar = document.createElement('div')
              toolbar.style.position = 'absolute'
              toolbar.style.right = '0.5rem'
              toolbar.style.top = '0.5rem'
              toolbar.style.display = 'flex'
              toolbar.style.gap = '0.25rem'
              toolbar.style.background = 'rgba(0,0,0,0.35)'
              toolbar.style.padding = '0.25rem 0.35rem'
              toolbar.style.borderRadius = '0.375rem'
              toolbar.style.backdropFilter = 'blur(4px)'
              toolbar.innerHTML = `
                <button data-a="zin">＋</button>
                <button data-a="zout">－</button>
                <button data-a="reset">⟲</button>
                <button data-a="save">⬇︎</button>
              `
              toolbar.querySelectorAll('button').forEach((b: any) => {
                b.style.color = '#fff'
                b.style.fontSize = '14px'
                b.style.lineHeight = '1'
                b.style.padding = '2px 6px'
                b.style.border = '1px solid rgba(255,255,255,.2)'
                b.style.borderRadius = '4px'
                b.style.background = 'transparent'
                b.style.cursor = 'pointer'
              })
              host.style.position = 'relative'
              host.appendChild(toolbar)

              const svgForSave = host.querySelector('svg') as SVGSVGElement | null
              const setScale = (factor: number) => {
                controller.setScaleRelative(factor)
              }
              toolbar.addEventListener('click', (e: any) => {
                const a = e.target?.dataset?.a
                if (!a) return
                if (a === 'zin') setScale(1.15)
                if (a === 'zout') setScale(1 / 1.15)
                if (a === 'reset') controller.reset()
                if (a === 'save' && svgForSave) {
                  const blob = new Blob([svgForSave.outerHTML], { type: 'image/svg+xml;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `diagram-${Date.now()}.svg`
                  link.click()
                  URL.revokeObjectURL(url)
                }
              })
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
    <div ref={containerRef} className="space-y-8">
      {charts.map((code, idx) => (
        <div key={idx} data-mermaid data-mermaid-code={code} className="min-h-[200px]" />
      ))}
    </div>
  )
}


