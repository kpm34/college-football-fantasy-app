'use client'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

export default function ScenePage() {
  return (
    <main className="min-h-screen">
      <Scene />
    </main>
  )
}
