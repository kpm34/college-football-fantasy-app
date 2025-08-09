'use client'
import { useGLTF, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useEffect } from 'react'
import { useCreateStore } from 'leva'
import { MaterialEditor } from './MaterialEditor'
import { TEXTURE_LIBRARY } from '@/lib/textureLibrary'
import { useMaterial } from './MaterialContext'

interface FootballEnhancedProps {
  url: string
  scale?: number
}

export function FootballEnhanced({ url, scale = 1 }: FootballEnhancedProps) {
  const gltf = useGLTF(url)
  const { gl } = useThree()
  const { config: materialConfig } = useMaterial()

  // Load textures dynamically based on selection
  const textureUrls = useMemo(() => {
    if (!materialConfig.useTexture || !materialConfig.selectedTexture) return []
    const texture = TEXTURE_LIBRARY.find(t => t.id === materialConfig.selectedTexture)
    return texture ? [texture.url] : []
  }, [materialConfig.useTexture, materialConfig.selectedTexture])

  // 1x1 transparent PNG to avoid network 404s when no texture selected
  const PLACEHOLDER_DATA_URL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAOZcJNEAAAAASUVORK5CYII='

  const textures = useTexture(
    textureUrls.length > 0 ? textureUrls : [PLACEHOLDER_DATA_URL]
  ) as unknown as THREE.Texture[] | THREE.Texture
  const mainTexture = Array.isArray(textures) ? textures[0] : textures

  // Configure texture
  useEffect(() => {
    if (mainTexture && materialConfig.useTexture) {
      mainTexture.wrapS = THREE.RepeatWrapping
      mainTexture.wrapT = THREE.RepeatWrapping
      mainTexture.repeat.set(materialConfig.textureScale.scaleX, materialConfig.textureScale.scaleY)
      mainTexture.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy?.() ?? 8)
      mainTexture.minFilter = THREE.LinearMipmapLinearFilter
      mainTexture.magFilter = THREE.LinearFilter
      mainTexture.generateMipmaps = true
      ;(mainTexture as THREE.Texture & { colorSpace?: THREE.ColorSpace }).colorSpace = THREE.SRGBColorSpace
      mainTexture.needsUpdate = true
    }
  }, [mainTexture, materialConfig.textureScale, materialConfig.useTexture, gl])

  // Create material based on configuration
  const material = useMemo(() => {
    // If gradient enabled, create a canvas texture composited over base color
    let color: THREE.Color | undefined
    let gradientMap: THREE.Texture | null = null
    if (materialConfig.gradient?.enabled) {
      const res = Math.max(64, Math.min(2048, materialConfig.gradient.resolution || 512))
      const canvas = document.createElement('canvas')
      canvas.width = res
      canvas.height = res
      const ctx = canvas.getContext('2d')!
      const rad = (materialConfig.gradient.angle * Math.PI) / 180
      const x = Math.cos(rad) * res
      const y = Math.sin(rad) * res
      const grad = ctx.createLinearGradient(0, 0, x, y)
      grad.addColorStop(0, materialConfig.gradient.colorA)
      grad.addColorStop(1, materialConfig.gradient.colorB)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, res, res)
      gradientMap = new THREE.CanvasTexture(canvas)
      gradientMap.colorSpace = THREE.SRGBColorSpace
      gradientMap.needsUpdate = true
    } else {
      color = new THREE.Color(materialConfig.surface.color)
    }
    
    // Use MeshPhysicalMaterial for transparency effects
    if (materialConfig.transparency.transmission > 0) {
      return new THREE.MeshPhysicalMaterial({
        color,
        roughness: materialConfig.surface.roughness,
        metalness: materialConfig.surface.metalness,
        transmission: materialConfig.transparency.transmission,
        thickness: materialConfig.transparency.thickness,
        ior: materialConfig.transparency.ior,
        clearcoat: materialConfig.reflections.clearcoat,
        clearcoatRoughness: materialConfig.reflections.clearcoatRoughness,
        envMapIntensity: materialConfig.reflections.envMapIntensity,
        map: materialConfig.useTexture ? mainTexture : gradientMap,
      })
    }
    
    // Use standard material for opaque surfaces
    return new THREE.MeshStandardMaterial({
      color,
      roughness: materialConfig.surface.roughness,
      metalness: materialConfig.surface.metalness,
      envMapIntensity: materialConfig.reflections.envMapIntensity,
      map: materialConfig.useTexture ? mainTexture : gradientMap,
      clearcoat: materialConfig.reflections.clearcoat,
      clearcoatRoughness: materialConfig.reflections.clearcoatRoughness,
          } as THREE.MeshStandardMaterialParameters)
  }, [materialConfig, mainTexture])

  // Apply material to all meshes in the scene
  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true)
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).material = material
      }
    })
    return cloned
  }, [gltf.scene, material])

  return <primitive object={scene} scale={scale} />
}

// Export the UI component separately for use in Scene
export function MaterialEditorPanel() {
  const { setConfig } = useMaterial()
  const store = useCreateStore()
  
  return (
    <div className="w-full h-full rounded-xl shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a6 6 0 00-2-4l-2-2m0 0V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6m8 0l-2-2m-2 2h6" />
            </svg>
            Material Studio
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">Powered by</span>
            <span className="font-semibold">Three.js</span>
          </div>
        </div>
        <MaterialEditor store={store} onMaterialChange={setConfig} />
      </div>
    </div>
  )
}
