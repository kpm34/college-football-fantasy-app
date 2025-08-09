'use client'
import { useState, useEffect } from 'react'
import { useControls, folder } from 'leva'
import { TEXTURE_LIBRARY, MATERIAL_PRESETS, type TextureCategory, type MaterialPreset } from '@/lib/textureLibrary'

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
    angle: number
    resolution: number
  }
}

interface MaterialEditorProps {
  store?: unknown
  onMaterialChange?: (material: MaterialConfig) => void
}

// Tooltip component for hover explanations
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onTouchStart={() => setShow(!show)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 px-2 py-1 text-xs text-white bg-gray-800 rounded-md whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2">
          {text}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  )
}

export function MaterialEditor({ store, onMaterialChange }: MaterialEditorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TextureCategory>('metal')
  const [selectedTexture, setSelectedTexture] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<MaterialPreset | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Main material controls with intuitive organization
  const materialControls = useControls(
    'Material',
    {
      // Surface appearance
      surface: folder({
        color: {
          value: '#666666',
          label: 'Base Color',
          hint: 'The main color of the material'
        },
        roughness: {
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Roughness',
          hint: 'How rough or smooth the surface is (0 = mirror, 1 = matte)'
        },
        metalness: {
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Metallic',
          hint: 'How metallic the surface is (0 = non-metal, 1 = full metal)'
        },
      }),
      
      // Reflections
      reflections: folder({
        envMapIntensity: {
          value: 1,
          min: 0,
          max: 2,
          step: 0.01,
          label: 'Reflection Strength',
          hint: 'How strong environmental reflections are'
        },
        clearcoat: {
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Clear Coat',
          hint: 'Adds a glossy layer on top (like car paint)'
        },
        clearcoatRoughness: {
          value: 0.1,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Coat Roughness',
          hint: 'Roughness of the clear coat layer'
        },
      }),
      
      // Transparency (advanced)
      transparency: folder({
        transmission: {
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
          label: 'Transparency',
          hint: 'How see-through the material is'
        },
        ior: {
          value: 1.5,
          min: 1.0,
          max: 2.333,
          step: 0.01,
          label: 'Refraction',
          hint: 'How light bends through the material (glass = 1.5)'
        },
        thickness: {
          value: 0.5,
          min: 0,
          max: 2,
          step: 0.01,
          label: 'Thickness',
          hint: 'Apparent thickness for transparent materials'
        },
      }, { collapsed: !showAdvanced }),

      // Gradient fill (composited over base color)
      gradient: folder({
        enabled: { value: false, label: 'Enable Gradient' },
        colorA: { value: '#ff6b6b', label: 'Color A' },
        colorB: { value: '#4a90e2', label: 'Color B' },
        angle: { value: 45, min: 0, max: 360, step: 1, label: 'Angle' },
        resolution: { value: 512, min: 64, max: 2048, step: 64, label: 'Resolution' },
      }, { collapsed: true }),
    },
    { store: store as never }
  )

  // Texture controls
  const textureControls = useControls(
    'Textures',
    {
      useTexture: {
        value: false,
        label: 'Enable Texture',
      },
      metalness: { value: 0.0, min: 0, max: 1, step: 0.01, label: 'Metalness' },
      roughness: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Roughness' },
      envMapIntensity: { value: 1, min: 0, max: 2, step: 0.01, label: 'Env Intensity' },
      textureScale: folder({
        scaleX: {
          value: 1,
          min: 0.1,
          max: 10,
          step: 0.1,
          label: 'Scale X',
          hint: 'Horizontal texture scale'
        },
        scaleY: {
          value: 1,
          min: 0.1,
          max: 10,
          step: 0.1,
          label: 'Scale Y',
          hint: 'Vertical texture scale'
        },
      }, { collapsed: true }),
      normalMap: folder({
        useNormal: {
          value: false,
          label: 'Normal Map',
          hint: 'Adds surface detail without geometry'
        },
        normalScale: {
          value: 1,
          min: 0,
          max: 2,
          step: 0.1,
          label: 'Normal Strength',
        },
      }, { collapsed: true }),
    },
    { store: store as never }
  )

  // Apply preset
  const applyPreset = (preset: MaterialPreset) => {
    setSelectedPreset(preset)
    // Apply preset to material configuration (UI values remain unchanged)
    if (onMaterialChange) {
      const nextConfig: MaterialConfig = {
        surface: {
          color: preset.color,
          roughness: preset.roughness,
          metalness: preset.metalness,
        },
        reflections: {
          envMapIntensity: preset.envMapIntensity,
          clearcoat: preset.clearcoat ?? 0,
          clearcoatRoughness: preset.clearcoatRoughness ?? 0.1,
        },
        transparency: {
          transmission: preset.transmission ?? 0,
          ior: preset.ior ?? 1.5,
          thickness: preset.thickness ?? 0.5,
        },
        useTexture: textureControls.useTexture,
        selectedTexture,
        textureScale: {
          // Folder values are flattened by Leva
          scaleX: (textureControls as unknown as Record<string, number>).scaleX ?? 1,
          scaleY: (textureControls as unknown as Record<string, number>).scaleY ?? 1,
        },
        normalMap: {
          useNormal: (textureControls as unknown as Record<string, boolean>).useNormal ?? false,
          normalScale: (textureControls as unknown as Record<string, number>).normalScale ?? 1,
        },
        gradient: {
          enabled: (materialControls as unknown as Record<string, boolean>).enabled ?? false,
          colorA: (materialControls as unknown as Record<string, string>).colorA ?? '#ff6b6b',
          colorB: (materialControls as unknown as Record<string, string>).colorB ?? '#4a90e2',
          angle: (materialControls as unknown as Record<string, number>).angle ?? 45,
          resolution: (materialControls as unknown as Record<string, number>).resolution ?? 512,
        },
      }
      setShowAdvanced((nextConfig.transparency.transmission ?? 0) > 0)
      onMaterialChange(nextConfig)
    }
  }

  // Notify parent of material changes
  useEffect(() => {
    if (!onMaterialChange) return
    const tc = textureControls as unknown as Record<string, number | boolean>
    const mc = materialControls as unknown as Record<string, number | string>
    const config: MaterialConfig = {
      surface: {
        color: (mc.color as string) ?? '#666666',
        roughness: (mc.roughness as number) ?? 0.5,
        metalness: (tc.metalness as number) ?? (mc.metalness as number) ?? 0,
      },
      reflections: {
        envMapIntensity: (tc.envMapIntensity as number) ?? (mc.envMapIntensity as number) ?? 1,
        clearcoat: (mc.clearcoat as number) ?? 0,
        clearcoatRoughness: (mc.clearcoatRoughness as number) ?? 0.1,
      },
      transparency: {
        transmission: (mc.transmission as number) ?? 0,
        ior: (mc.ior as number) ?? 1.5,
        thickness: (mc.thickness as number) ?? 0.5,
      },
      useTexture: Boolean(tc.useTexture),
      selectedTexture,
      textureScale: {
        scaleX: (tc.scaleX as number) ?? 1,
        scaleY: (tc.scaleY as number) ?? 1,
      },
      normalMap: {
        useNormal: Boolean(tc.useNormal),
        normalScale: (tc.normalScale as number) ?? 1,
      },
      gradient: {
        enabled: Boolean((mc.enabled as unknown as boolean) ?? false),
        colorA: (mc.colorA as string) ?? '#ff6b6b',
        colorB: (mc.colorB as string) ?? '#4a90e2',
        angle: (mc.angle as unknown as number) ?? 45,
        resolution: (mc.resolution as unknown as number) ?? 512,
      },
    }
    onMaterialChange(config)
  }, [materialControls, textureControls, selectedTexture, onMaterialChange])

  return (
    <div className="material-editor">
      {/* Preset Gallery */}
      <div className="preset-gallery mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Material Presets
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {MATERIAL_PRESETS.map((preset) => (
            <Tooltip key={preset.id} text={preset.name}>
              <button
                onClick={() => applyPreset(preset)}
                className={`
                  relative w-full aspect-square rounded-lg border-2 transition-all
                  ${selectedPreset?.id === preset.id 
                    ? 'border-blue-500 scale-110' 
                    : 'border-transparent hover:border-gray-400'
                  }
                `}
                style={{
                  background: `linear-gradient(135deg, ${preset.color} 0%, ${preset.color}dd 100%)`,
                  boxShadow: selectedPreset?.id === preset.id 
                    ? '0 0 20px rgba(59, 130, 246, 0.5)' 
                    : '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent" />
                {preset.metalness > 0.8 && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent via-white/30 to-transparent" />
                )}
              </button>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Texture Library */}
      {textureControls.useTexture && (
        <div className="texture-library mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Texture Library
          </h3>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 mb-3">
            {(['metal', 'fabric', 'ceramic', 'glass', 'organic', 'synthetic'] as TextureCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1 text-xs rounded-full transition-all capitalize
                  ${selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Texture Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TEXTURE_LIBRARY
              .filter(tex => tex.category === selectedCategory)
              .map((texture) => (
                <Tooltip key={texture.id} text={texture.name}>
                  <button
                    onClick={() => setSelectedTexture(texture.id)}
                    className={`
                      relative w-full aspect-square rounded-lg border-2 overflow-hidden transition-all
                      ${selectedTexture === texture.id
                        ? 'border-blue-500 scale-110'
                        : 'border-transparent hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500">
                      {texture.name}
                    </div>
                  </button>
                </Tooltip>
              ))}
          </div>
        </div>
      )}

      {/* Advanced Toggle */}
      <div className="mt-4 flex items-center justify-between px-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Advanced Options
        </span>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'}
        </button>
      </div>

      <style jsx>{`
        .material-editor {
          max-width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        /* Mobile responsive adjustments */
        @media (max-width: 640px) {
          .preset-gallery, .texture-library {
            padding: 12px;
          }
          
          .grid {
            gap: 8px;
          }
        }
        
        /* Hide Leva's clipboard icons globally */
        :global(.leva-c-kWYeOK-bCBHqk-size-m svg) {
          display: none !important;
        }
        
        /* Improve Leva panel styling */
        :global(.leva-c-kDhLfI) {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9) !important;
        }
        
        :global(.dark .leva-c-kDhLfI) {
          background: rgba(30, 30, 30, 0.9) !important;
        }
        
        /* Make Leva controls larger on mobile */
        @media (max-width: 640px) {
          :global(.leva-c-grzFYT) {
            min-height: 32px;
          }
          
          :global(.leva-c-dpdPdP) {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}
