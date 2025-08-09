'use client'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./scene/Scene'), { ssr: false })

export default function Home() {
  const webglOn = typeof document === 'undefined'
    ? true
    : document.body.dataset.webgl === 'on'

  return (
    <main className="relative min-h-[300vh]">
      <section className="sticky top-0 h-screen">
        {webglOn ? <Scene /> : <FallbackHero />}
      </section>

      <section className="mx-auto max-w-2xl px-6 py-32 text-neutral-200">
        <h2 className="text-3xl font-semibold mb-4">Feature Flags</h2>
        <p>Flip <code>enableWebGL</code> in Edge Config to switch this hero at runtime.</p>
      </section>
    </main>
  )
}

function FallbackHero() {
  return (
    <div className="h-full grid place-items-center bg-black/80 text-white">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">3D disabled</div>
        <div className="opacity-70">Toggle <code>enableWebGL</code> to re-enable.</div>
      </div>
    </div>
  )
}
