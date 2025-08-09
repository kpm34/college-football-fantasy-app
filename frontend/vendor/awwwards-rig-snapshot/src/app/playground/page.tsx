'use client'
import { motion } from 'framer-motion'
import { fadeInUp, stagger } from '@/lib/animations'
import { useScrollProgress } from '@/hooks/useScrollProgress'

export default function PlaygroundPage() {
  const progress = useScrollProgress()
  return (
    <main className="min-h-screen p-8 space-y-12">
      {/* Top progress bar */}
      <div className="fixed left-0 top-0 h-1 bg-blue-500/80 z-50" style={{ width: `${progress * 100}%` }} />
      <section>
        <motion.h1
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-3xl font-semibold"
        >
          Playground
        </motion.h1>
        <motion.p
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-neutral-400 mt-2"
        >
          Experiment with animations and styles.
        </motion.p>
      </section>

      <motion.section
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[1,2,3].map((i) => (
          <motion.div
            key={i}
            variants={fadeInUp}
            className="rounded-xl border border-neutral-800 p-6 bg-neutral-900/40 fade-in-up"
          >
            <h3 className="font-medium mb-2">Card {i}</h3>
            <p className="text-sm text-neutral-400">Use this space to try motion, gsap, and CSS effects.</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Scene removed here to avoid multiple <Canvas> mounts in dev */}
    </main>
  )
}
