'use client'
import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'

type FootballModelProps = {
  url: string
  scale?: number
}

export function FootballModel({ url, scale = 1 }: FootballModelProps) {
  const gltf = useGLTF(url)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  return <primitive object={scene} scale={scale} />
}



