'use client'
import { useEffect, useState } from 'react'

export function useAssetExists(url: string) {
  const [exists, setExists] = useState<boolean>(false)
  useEffect(() => {
    let aborted = false
    const check = async () => {
      try {
        const href = encodeURI(url)
        const res = await fetch(href, { method: 'HEAD' })
        if (!aborted) setExists(res.ok)
      } catch {
        if (!aborted) setExists(false)
      }
    }
    check()
    return () => { aborted = true }
  }, [url])
  return exists
}


