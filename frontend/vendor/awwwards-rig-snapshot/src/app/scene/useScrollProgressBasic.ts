'use client'
import { useEffect, useState } from 'react'

export function useScrollProgressBasic() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    let raf: number | null = null
    const update = () => {
      raf = null
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const current = window.scrollY || doc.scrollTop || 0
      const p = max > 0 ? Math.min(1, Math.max(0, current / max)) : 0
      setProgress(p)
    }
    const onScroll = () => { if (raf == null) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])
  return progress
}


