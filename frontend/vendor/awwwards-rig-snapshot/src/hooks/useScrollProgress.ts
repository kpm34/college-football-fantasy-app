'use client'
import { useEffect, useState } from 'react'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let st: { kill: () => void } | null = null
    let mounted = true
    ;(async () => {
      try {
        const gsapMod = await import('gsap')
        const stMod = await import('gsap/ScrollTrigger')
        const gsap = gsapMod.default
        const ScrollTrigger = stMod.ScrollTrigger
        gsap.registerPlugin(ScrollTrigger)

        if (!mounted) return
        st = ScrollTrigger.create({
          scroller: document.documentElement,
          trigger: document.documentElement,
          start: 0,
          end: 'max',
          onUpdate: (self) => setProgress(self.progress),
        })
        ScrollTrigger.refresh()
      } catch (e) {
        // If GSAP/ScrollTrigger isn’t available, fail gracefully
        console.warn('useScrollProgress: GSAP not available, skipping.', e)
      }
    })()

    return () => {
      if (st) st.kill()
      mounted = false
    }
  }, [])

  return progress
}


