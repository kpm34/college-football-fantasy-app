'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface MaterialConfig {
  surface: {
    color: string
    roughness: number
    metalness: number
  }
  reflections: {
    envMapIntensity: number
    clearcoat: number
    clearcoatRoughness: number
  }
  transparency: {
    transmission: number
    ior: number
    thickness: number
  }
  useTexture: boolean
  selectedTexture: string | null
  textureScale: {
    scaleX: number
    scaleY: number
  }
  normalMap: {
    useNormal: boolean
    normalScale: number
  }
  gradient: {
    enabled: boolean
    colorA: string
    colorB: string
    angle: number // degrees
    resolution: number // px
  }
}

const defaultConfig: MaterialConfig = {
  surface: {
    color: '#222222',
    roughness: 0.95,
    metalness: 0,
  },
  reflections: {
    envMapIntensity: 0.5,
    clearcoat: 0,
    clearcoatRoughness: 0.1,
  },
  transparency: {
    transmission: 0,
    ior: 1.5,
    thickness: 0.5,
  },
  useTexture: false,
  selectedTexture: null,
  textureScale: {
    scaleX: 1,
    scaleY: 1,
  },
  normalMap: {
    useNormal: false,
    normalScale: 1,
  },
  gradient: {
    enabled: false,
    colorA: '#ff6b6b',
    colorB: '#4a90e2',
    angle: 45,
    resolution: 512,
  },
}

interface MaterialContextType {
  config: MaterialConfig
  setConfig: (config: MaterialConfig) => void
  updateConfig: (updates: Partial<MaterialConfig>) => void
}

const MaterialContext = createContext<MaterialContextType | undefined>(undefined)

export function MaterialProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MaterialConfig>(defaultConfig)

  const updateConfig = (updates: Partial<MaterialConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <MaterialContext.Provider value={{ config, setConfig, updateConfig }}>
      {children}
    </MaterialContext.Provider>
  )
}

export function useMaterial() {
  const context = useContext(MaterialContext)
  if (!context) {
    throw new Error('useMaterial must be used within MaterialProvider')
  }
  return context
}
