'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Suspense, useRef, useState } from 'react'
import { Environment, PerformanceMonitor } from '@react-three/drei'
import { useScrollProgressBasic } from './useScrollProgressBasic'
import { FootballEnhanced, MaterialEditorPanel } from './FootballEnhanced'
import { useAssetExists } from '@/hooks/useAssetExists'
import { MaterialProvider } from './MaterialContext'

// simple lerp helper
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
// ease curve so the middle of the page has more motion
const easeInOut = (x: number) => 0.5 * (1 - Math.cos(Math.PI * x))
const TOTAL_SPINS = 1 // slowish: 1 full spin across the page
const TOTAL_ROT = TOTAL_SPINS * 2 * Math.PI

function FallbackBox() {
  return (
    <mesh>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color="#cfd6ff" metalness={0.3} roughness={0.35} />
    </mesh>
  )
}

function SpinningGroup({ progress, children }: { progress: number; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null!)
  useFrame(() => {
    const p = easeInOut(progress)
    const targetY = p * TOTAL_ROT
    groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, targetY, 0.06)
  })
  return <group ref={groupRef} scale={1.05}>{children}</group>
}

// Enhanced lighting for better material visualization
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#ffeaa7" />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#74b9ff" />
    </>
  )
}

export default function Scene() {
  const progress = useScrollProgressBasic()
  const footballExists = useAssetExists('/models/Football.glb')
  const [showEditor, setShowEditor] = useState(true)
  const [performanceMode, setPerformanceMode] = useState<'high' | 'low'>('high')

  return (
    <MaterialProvider>
      <>
      {/* Material Editor UI - Outside Canvas */}
      {showEditor && (
        <div className="material-editor-wrapper fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[420px] z-50">
          <MaterialEditorPanel />
        </div>
      )}

      {/* Editor Toggle Button */}
      <button
        onClick={() => setShowEditor(!showEditor)}
        className="fixed top-4 right-4 z-50 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
        aria-label="Toggle Material Editor"
      >
        <svg 
          className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:rotate-180 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
          />
        </svg>
      </button>

      {/* 3D Canvas */}
      <Canvas
        dpr={performanceMode === 'high' ? [1, 2] : [1, 1]}
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ 
          antialias: performanceMode === 'high', 
          powerPreference: performanceMode === 'high' ? 'high-performance' : 'default',
          alpha: false 
        }}
        shadows={performanceMode === 'high'}
        onCreated={({ gl }) => {
          const canvas = gl.domElement as HTMLCanvasElement
           const onLost = (e: Event) => {
            e.preventDefault()
            console.warn('WebGL context lost. Attempting restore...')
             // Lower quality on restore attempt
             setPerformanceMode('low')
           }
           const onRestored = () => {
            console.info('WebGL context restored.')
          }
          canvas.addEventListener('webglcontextlost', onLost, { passive: false })
          canvas.addEventListener('webglcontextrestored', onRestored)
          // improve sharpness on retina without changing CSS zoom
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        }}
      >
        <color attach="background" args={['#f0f0f0']} />
        
        {/* Performance monitoring */}
        {performanceMode === 'high' && (
          <PerformanceMonitor
            onDecline={() => {
              console.log('Performance declining, switching to low mode')
              setPerformanceMode('low')
            }}
            flipflops={3}
            factor={0.5}
          />
        )}

        {/* Lighting */}
        <SceneLighting />
        
        {/* Environment for reflections */}
        {/* Environment for reflections; avoid heavy HDRI on low mode */}
        {performanceMode === 'high' && <Environment preset="city" />}

        {/* Main content */}
        <Suspense fallback={<SpinningGroup progress={progress}><FallbackBox /></SpinningGroup>}>
          {footballExists ? (
            <SpinningGroup progress={progress}>
              <FootballEnhanced url="/models/Football.glb" scale={1.2} />
            </SpinningGroup>
          ) : (
            <SpinningGroup progress={progress}>
              <FallbackBox />
            </SpinningGroup>
          )}
        </Suspense>
      </Canvas>

      {/* Mobile-friendly styles */}
      <style jsx global>{`
        .material-editor-wrapper {
          max-height: 70vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.2) transparent;
        }
        
        .material-editor-wrapper::-webkit-scrollbar {
          width: 6px;
        }
        
        .material-editor-wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .material-editor-wrapper::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        
        /* Dark mode scrollbar */
        @media (prefers-color-scheme: dark) {
          .material-editor-wrapper::-webkit-scrollbar-thumb {
            background-color: rgba(255,255,255,0.2);
          }
        }
        
        /* Hide Leva clipboard icons */
        .leva-c-kWYeOK-bCBHqk-size-m svg {
          display: none !important;
        }
        
        /* Mobile adjustments */
        @media (max-width: 640px) {
          .material-editor-wrapper {
            bottom: 0;
            left: 0;
            right: 0;
            width: 100% !important;
            border-radius: 16px 16px 0 0;
            max-height: 60vh;
          }
        }
      `}</style>
    </>
    </MaterialProvider>
  )
}