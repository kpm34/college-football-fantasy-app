'use client'
import { useGLTF, useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useEffect } from 'react'
import { useControls } from 'leva'

type FootballWithTextureProps = {
  url: string
  textureUrl: string
  blendUrl?: string
  blendFactor?: number // 0..1, how much of blendUrl to mix in
  scale?: number
  materialStore?: unknown
  textureStore?: unknown
  templatesStore?: unknown
}

export function FootballWithTexture({ url, textureUrl, blendUrl, blendFactor = 0.8, scale = 1, materialStore, textureStore, templatesStore }: FootballWithTextureProps) {
  const gltf = useGLTF(url)
  const maps = useTexture([textureUrl, blendUrl || textureUrl]) as unknown as [THREE.Texture, THREE.Texture]
  const base = maps[0]
  const blend = maps[1]
  const { gl } = useThree()

  type MaterialControls = {
    usePreset: boolean
    colorPreset: string
    color: string
    roughness: number
    metalness: number
    envMapIntensity: number
    usePhysical: boolean
    transmission: number
    ior: number
    thickness: number
    clearcoat: number
    clearcoatRoughness: number
  }

  const controls = useControls(
    {
    usePreset: { value: true, label: 'Use Preset Color' },
    colorPreset: {
      label: 'Preset Color',
      options: {
        'Matte Black': '#222222',
        'Jet Black': '#0d0d0d',
        'Charcoal': '#2a2a2a',
        'Steel': '#6b7280',
        'Warm Gray': '#78716c',
        'Pure White': '#ffffff',
      },
      value: '#222222',
    },
    color: { value: '#222222', label: 'Custom Color' },
    roughness: { value: 0.95, min: 0, max: 1, step: 0.01 },
    metalness: { value: 0.0, min: 0, max: 1, step: 0.01 },
    envMapIntensity: { value: 0.0, min: 0, max: 2, step: 0.01 },
    usePhysical: { value: false },
    transmission: { value: 0.0, min: 0, max: 1, step: 0.01 },
    ior: { value: 1.45, min: 1.0, max: 2.333, step: 0.01 },
    thickness: { value: 0.0, min: 0, max: 2, step: 0.01 },
    clearcoat: { value: 0.0, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.2, min: 0, max: 1, step: 0.01 },
  },
  { store: materialStore as never, folder: 'Basic' as never }
  ) as unknown as MaterialControls

  type TextureControls = {
    useBaseTexture: boolean
    useBlendTexture: boolean
    uiBlendFactor: number
    repeatX: number
    repeatY: number
  }

  const texControls = useControls(
    {
      useBaseTexture: { value: false, label: 'Use Base Texture' },
      useBlendTexture: { value: false, label: 'Use Blend Texture' },
      uiBlendFactor: { label: 'Blend Factor', value: blendFactor, min: 0, max: 1, step: 0.01 },
      repeatX: { value: 1, min: 0.25, max: 6, step: 0.25 },
      repeatY: { value: 1, min: 0.25, max: 6, step: 0.25 },
    },
    { store: textureStore as never, folder: 'Detail' as never }
  ) as unknown as TextureControls

  // Templates panel: quick presets for common looks
  const templates = useControls(
    {
      preset: {
        label: 'Material Preset',
        options: {
          'Matte Black': 'matte-black',
          'Brushed Metal': 'brushed-metal',
          'Polished Metal': 'polished-metal',
          'Frosted Glass': 'frosted-glass',
          'Clear Glass': 'clear-glass',
          'Concrete': 'concrete',
          'Ceramic': 'ceramic',
          'Fabric': 'fabric',
        },
        value: 'matte-black',
      },
      apply: { label: 'Apply', value: false },
    },
    { store: templatesStore as never, folder: 'Templates' as never }
  ) as unknown as { preset: string; apply: boolean }

  useEffect(() => {
    if (!templates.apply) return
    switch (templates.preset) {
      case 'matte-black':
        controls.usePhysical = false
        controls.roughness = 0.95
        controls.metalness = 0.0
        controls.envMapIntensity = 0.0
        controls.color = '#222222'
        texControls.useBaseTexture = false
        texControls.useBlendTexture = false
        break
      case 'brushed-metal':
        controls.usePhysical = false
        controls.roughness = 0.6
        controls.metalness = 1.0
        controls.envMapIntensity = 1.2
        texControls.useBaseTexture = true
        texControls.useBlendTexture = true
        break
      case 'polished-metal':
        controls.usePhysical = false
        controls.roughness = 0.2
        controls.metalness = 1.0
        controls.envMapIntensity = 1.5
        texControls.useBaseTexture = true
        texControls.useBlendTexture = false
        break
      case 'frosted-glass':
        controls.usePhysical = true
        controls.transmission = 0.9
        controls.thickness = 0.6
        controls.ior = 1.45
        controls.roughness = 0.6
        controls.metalness = 0.0
        controls.envMapIntensity = 0.6
        texControls.useBaseTexture = false
        texControls.useBlendTexture = true
        break
      case 'clear-glass':
        controls.usePhysical = true
        controls.transmission = 1.0
        controls.thickness = 0.2
        controls.ior = 1.5
        controls.roughness = 0.05
        controls.envMapIntensity = 0.8
        texControls.useBaseTexture = false
        texControls.useBlendTexture = false
        break
      case 'concrete':
        controls.usePhysical = false
        controls.roughness = 0.95
        controls.metalness = 0.0
        controls.envMapIntensity = 0.1
        texControls.useBaseTexture = true
        texControls.useBlendTexture = true
        break
      case 'ceramic':
        controls.usePhysical = false
        controls.roughness = 0.2
        controls.metalness = 0.0
        controls.envMapIntensity = 0.6
        texControls.useBaseTexture = true
        texControls.useBlendTexture = false
        break
      case 'fabric':
        controls.usePhysical = false
        controls.roughness = 0.9
        controls.metalness = 0.0
        controls.envMapIntensity = 0.1
        texControls.useBaseTexture = true
        texControls.useBlendTexture = true
        break
      default:
        break
    }
  }, [templates.apply, templates.preset, controls, texControls])

  // Improve texture quality and color space
  ;[base, blend].forEach((tex: THREE.Texture) => {
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy?.() ?? 8)
    tex.minFilter = THREE.LinearMipmapLinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = true
    type TextureWithColorSpace = THREE.Texture & { colorSpace?: THREE.ColorSpace | number }
    const t = tex as TextureWithColorSpace
    t.colorSpace = (THREE as unknown as { SRGBColorSpace: THREE.ColorSpace }).SRGBColorSpace
  })

  useEffect(() => {
    base.repeat.set(texControls.repeatX, texControls.repeatY)
    blend.repeat.set(texControls.repeatX, texControls.repeatY)
    base.needsUpdate = true
    blend.needsUpdate = true
  }, [base, blend, texControls.repeatX, texControls.repeatY])

  // Create material from controls
  const toThreeColor = (c: string): THREE.Color => new THREE.Color(c)

  const material = useMemo(() => {
    const chosen = controls.usePreset ? controls.colorPreset : controls.color
    const color = toThreeColor(chosen)
    if (controls.usePhysical) {
      const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: controls.roughness,
        metalness: controls.metalness,
        transmission: controls.transmission,
        thickness: controls.thickness,
        ior: controls.ior,
        clearcoat: controls.clearcoat,
        clearcoatRoughness: controls.clearcoatRoughness,
        envMapIntensity: controls.envMapIntensity,
        map: texControls.useBaseTexture ? base : null,
      })
      return mat
    }
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: controls.roughness,
      metalness: controls.metalness,
      envMapIntensity: controls.envMapIntensity,
      map: texControls.useBaseTexture ? base : null,
      roughnessMap: texControls.useBlendTexture ? blend : undefined,
    })
    return mat
  }, [
    controls.color,
    controls.colorPreset,
    controls.usePreset,
    controls.roughness,
    controls.metalness,
    controls.envMapIntensity,
    controls.usePhysical,
    controls.transmission,
    controls.thickness,
    controls.ior,
    controls.clearcoat,
    controls.clearcoatRoughness,
    texControls.useBaseTexture,
    texControls.useBlendTexture,
    base,
    blend,
  ])

  const scene = useMemo(() => {
    const cloned = gltf.scene.clone(true)
    cloned.traverse((obj: THREE.Object3D) => {
      const mesh = obj as THREE.Mesh
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mesh as any).isMesh) {
        mesh.material = material
      }
    })
    return cloned
  }, [gltf.scene, material])

  return <primitive object={scene} scale={scale} />
}


