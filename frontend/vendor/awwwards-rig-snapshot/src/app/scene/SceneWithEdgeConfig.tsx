'use client'

import { Canvas } from '@react-three/fiber'
import { Suspense, useState, useMemo } from 'react'
import { PerformanceMonitor, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import Scene from './Scene'

// Fallback component when WebGL is disabled
function WebGLDisabled() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">3D View Unavailable</h2>
        <p className="text-gray-600">WebGL is currently disabled or unavailable on your device.</p>
      </div>
    </div>
  )
}

// Loading component
function LoadingScene() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="animate-pulse">Loading 3D Scene...</div>
    </div>
  )
}

export default function SceneWithEdgeConfig() {
  // Simple client-side read based on body data attribute set by layout
  const config = useMemo(() => ({
    enabled: typeof document === 'undefined' ? true : document.body.dataset.webgl === 'on',
    quality: 'high' as 'low' | 'medium' | 'high' | 'ultra',
    dpr: 2,
  }), [])
  const loading = false
  const [performanceDecline, setPerformanceDecline] = useState(false)
  
  // Show loading state while fetching config
  if (loading) {
    return <LoadingScene />
  }
  
  // Show fallback if WebGL is disabled
  if (!config?.enabled) {
    return <WebGLDisabled />
  }
  
  // Map quality settings to GL configuration
  const glConfig = {
    low: {
      antialias: false,
      powerPreference: 'low-power' as WebGLPowerPreference,
      alpha: false,
      stencil: false,
      depth: true,
    },
    medium: {
      antialias: true,
      powerPreference: 'default' as WebGLPowerPreference,
      alpha: false,
      stencil: false,
      depth: true,
    },
    high: {
      antialias: true,
      powerPreference: 'high-performance' as WebGLPowerPreference,
      alpha: false,
      stencil: true,
      depth: true,
    },
    ultra: {
      antialias: true,
      powerPreference: 'high-performance' as WebGLPowerPreference,
      alpha: true,
      stencil: true,
      depth: true,
      preserveDrawingBuffer: true,
    },
  }
  
  const currentGLConfig = glConfig[config.quality] || glConfig.high
  
  return (
    <Canvas
      dpr={config.dpr}
      camera={{ position: [0, 0, 3], fov: 45 }}
      gl={currentGLConfig}
      shadows={config.quality !== 'low'}
      onCreated={({ gl }) => {
        const canvas = gl.domElement as HTMLCanvasElement
        
        // Handle context loss
        const onLost = (e: Event) => {
          e.preventDefault()
          console.warn('WebGL context lost. Attempting restore...')
        }
        const onRestored = () => {
          console.info('WebGL context restored.')
        }
        
        canvas.addEventListener('webglcontextlost', onLost, { passive: false })
        canvas.addEventListener('webglcontextrestored', onRestored)
        
        // Set pixel ratio based on config
        gl.setPixelRatio(Math.min(window.devicePixelRatio, config.dpr))
        
        // Additional optimizations for low quality
        if (config.quality === 'low') {
          gl.shadowMap.enabled = false
        }
      }}
    >
      {/* Performance monitoring and adaptive quality */}
      {config.quality !== 'low' && (
        <>
          <PerformanceMonitor
            onDecline={() => {
              console.warn('Performance declining')
              setPerformanceDecline(true)
            }}
            onIncline={() => {
              console.info('Performance improving')
              setPerformanceDecline(false)
            }}
            flipflops={3}
            factor={0.5}
          />
          <AdaptiveDpr pixelated={performanceDecline} />
          <AdaptiveEvents />
        </>
      )}
      
      {/* The actual scene content */}
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}