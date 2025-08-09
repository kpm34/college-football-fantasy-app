'use client'

import { useEffect, useState } from 'react'

export function useABTest<T extends string>(flagName: string): {
  variant: T | null
  loading: boolean
  isVariant: (check: T) => boolean
} {
  const [variant, setVariant] = useState<T | null>(null)

  useEffect(() => {
    if (flagName === 'heroVariant') {
      const on = typeof document !== 'undefined' && document.body.dataset.webgl === 'on'
      setVariant((on ? '3d' : 'static') as T)
    }
  }, [flagName])

  return {
    variant,
    loading: false,
    isVariant: (check: T) => variant === check,
  }
}


