'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Light client-only overlay to capture a screenshot and POST to /api/cursor-report
export default function DevCursorOverlay() {
  const [enabled, setEnabled] = useState(false)
  const capturingRef = useRef(false)

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      // Ctrl+Shift+C to toggle overlay; Ctrl+Shift+S to send report
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
        setEnabled(v => !v)
      }
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
        void sendReport()
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const sendReport = useCallback(async () => {
    if (capturingRef.current) return
    capturingRef.current = true
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(document.body, { useCORS: true, backgroundColor: '#0b0b0b' })
      const blob = await new Promise<Blob | null>(res =>
        canvas.toBlob((b: Blob | null) => res(b), 'image/png')
      )
      if (!blob) throw new Error('Failed to capture')
      const form = new FormData()
      form.append('screenshot', blob, 'cursor-context.png')
      form.append('path', window.location.pathname)
      await fetch('/api/cursor-report', { method: 'POST', body: form })
      // eslint-disable-next-line no-alert
      alert('Sent cursor context to API')
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Send failed: ' + (e as Error).message)
    } finally {
      capturingRef.current = false
    }
  }, [])

  if (!enabled) return null

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999999 }}>
      <div style={{ position: 'absolute', right: 12, bottom: 12, pointerEvents: 'auto' }}>
        <div className="rounded bg-black/70 text-white px-3 py-2 text-xs shadow">
          <div className="font-semibold mb-1">Cursor Dev Overlay</div>
          <div>Ctrl+Shift+S: Send context</div>
          <div>Ctrl+Shift+C: Toggle overlay</div>
        </div>
      </div>
    </div>
  )
}
