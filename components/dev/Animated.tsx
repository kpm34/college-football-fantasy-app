'use client'

import Lottie from 'lottie-react'
import { useEffect, useState } from 'react'

type AnimatedProps = {
  src: string
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function Animated({ src, className, loop = true, autoplay = true }: AnimatedProps) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(src, { cache: 'no-store' })
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setData(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [src])

  if (!data) return null
  return <Lottie animationData={data} loop={loop} autoplay={autoplay} className={className} />
}
