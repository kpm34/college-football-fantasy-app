'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    lenisRef.current = lenis

    const loop = (time: number) => {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    // OPTIONAL GSAP integration (guarded + correct proxy)
    ;(async () => {
      try {
        const gsapMod = await import('gsap')
        const stMod = await import('gsap/ScrollTrigger')
        const gsap = gsapMod.default
        const ScrollTrigger = stMod.ScrollTrigger
        gsap.registerPlugin(ScrollTrigger)

        // Use the root scroller (html element), not body
        const scroller = document.documentElement

        ScrollTrigger.scrollerProxy(scroller, {
          scrollTop(value?: number) {
            if (value !== undefined) {
              // immediate = true prevents easing during ST's internal set
              lenis.scrollTo(value, { immediate: true })
            }
            // Return the actual scroll position (Lenis updates window/element scroll)
            return window.scrollY || scroller.scrollTop || 0
          },
          getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }
          },
          // pinType fix for smooth-scrolling (prevents jitter/blank)
          pinType: scroller.style.transform ? 'transform' : 'fixed',
        })

        // Keep ST updated with Lenis
        lenis.on('scroll', () => ScrollTrigger.update())
        ScrollTrigger.addEventListener('refresh', () => lenis.resize())

        // Give layout a tick, then refresh
        requestAnimationFrame(() => ScrollTrigger.refresh())
      } catch (e) {
        // If GSAP isn’t installed yet, just ignore
        console.warn('GSAP not wired; continuing without ScrollTrigger.', e)
      }
    })()

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lenisRef.current?.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
