'use client'

import { useABTest } from '@/lib/client-flags'
import dynamic from 'next/dynamic'

// Lazy load heavy components
const Scene3D = dynamic(() => import('@/app/scene/SceneWithEdgeConfig'), {
  ssr: false,
  loading: () => <div className="h-screen bg-gray-100 animate-pulse" />,
})

// Static hero variant
function StaticHero() {
  return (
    <div className="relative h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-white">
        <h1 className="text-6xl font-bold mb-4">Welcome to Awwwards Rig</h1>
        <p className="text-xl">High-performance web experiences</p>
      </div>
    </div>
  )
}

// Video hero variant
function VideoHero() {
  return (
    <div className="relative h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-white">
        <h1 className="text-6xl font-bold mb-4">Immersive Experiences</h1>
        <p className="text-xl">Powered by cutting-edge technology</p>
      </div>
    </div>
  )
}

// 3D hero variant
function Hero3D() {
  return (
    <div className="relative h-screen">
      <Scene3D />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="text-center text-white mix-blend-difference">
          <h1 className="text-6xl font-bold mb-4">Interactive 3D</h1>
          <p className="text-xl">Next-level web experiences</p>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const { variant, loading } = useABTest<'3d' | 'static' | 'video'>('heroVariant')
  
  // Show loading state while fetching variant
  if (loading) {
    return <div className="h-screen bg-gray-100 animate-pulse" />
  }
  
  // Render based on A/B test variant
  switch (variant) {
    case 'video':
      return <VideoHero />
    case 'static':
      return <StaticHero />
    case '3d':
    default:
      return <Hero3D />
  }
}