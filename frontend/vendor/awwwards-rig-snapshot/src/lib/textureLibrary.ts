// Texture library with categories and metadata
export type TextureCategory = 'fabric' | 'metal' | 'ceramic' | 'glass' | 'organic' | 'synthetic'

export interface TextureAsset {
  id: string
  name: string
  category: TextureCategory
  url: string
  thumbnail?: string
  properties?: {
    roughness?: number
    metalness?: number
    normalScale?: number
  }
}

// Built-in texture library
export const TEXTURE_LIBRARY: TextureAsset[] = [
  // Fabric textures
  {
    id: 'fabric-canvas',
    name: 'Canvas',
    category: 'fabric',
    url: '/textures/fabric/canvas.jpg',
    properties: { roughness: 0.9, metalness: 0 }
  },
  {
    id: 'fabric-denim',
    name: 'Denim',
    category: 'fabric',
    url: '/textures/fabric/denim.jpg',
    properties: { roughness: 0.85, metalness: 0 }
  },
  {
    id: 'fabric-leather',
    name: 'Leather',
    category: 'fabric',
    url: '/textures/fabric/leather.jpg',
    properties: { roughness: 0.7, metalness: 0.1 }
  },
  
  // Metal textures
  {
    id: 'metal-brushed',
    name: 'Brushed Steel',
    category: 'metal',
    url: '/textures/metal/brushed.jpg',
    properties: { roughness: 0.6, metalness: 1 }
  },
  {
    id: 'metal-polished',
    name: 'Polished Chrome',
    category: 'metal',
    url: '/textures/metal/chrome.jpg',
    properties: { roughness: 0.1, metalness: 1 }
  },
  {
    id: 'metal-rusted',
    name: 'Rusted Iron',
    category: 'metal',
    url: '/textures/metal/rust.jpg',
    properties: { roughness: 0.8, metalness: 0.9 }
  },
  
  // Ceramic textures
  {
    id: 'ceramic-glazed',
    name: 'Glazed Ceramic',
    category: 'ceramic',
    url: '/textures/ceramic/glazed.jpg',
    properties: { roughness: 0.2, metalness: 0 }
  },
  {
    id: 'ceramic-terracotta',
    name: 'Terracotta',
    category: 'ceramic',
    url: '/textures/ceramic/terracotta.jpg',
    properties: { roughness: 0.8, metalness: 0 }
  },
  
  // Glass textures
  {
    id: 'glass-frosted',
    name: 'Frosted Glass',
    category: 'glass',
    url: '/textures/glass/frosted.jpg',
    properties: { roughness: 0.6, metalness: 0 }
  },
  {
    id: 'glass-stained',
    name: 'Stained Glass',
    category: 'glass',
    url: '/textures/glass/stained.jpg',
    properties: { roughness: 0.3, metalness: 0 }
  },
  
  // Organic textures
  {
    id: 'organic-wood',
    name: 'Wood Grain',
    category: 'organic',
    url: '/textures/organic/wood.jpg',
    properties: { roughness: 0.8, metalness: 0 }
  },
  {
    id: 'organic-marble',
    name: 'Marble',
    category: 'organic',
    url: '/textures/organic/marble.jpg',
    properties: { roughness: 0.3, metalness: 0 }
  },
  
  // Synthetic textures
  {
    id: 'synthetic-carbon',
    name: 'Carbon Fiber',
    category: 'synthetic',
    url: '/textures/synthetic/carbon.jpg',
    properties: { roughness: 0.5, metalness: 0.3 }
  },
  {
    id: 'synthetic-plastic',
    name: 'Matte Plastic',
    category: 'synthetic',
    url: '/textures/synthetic/plastic.jpg',
    properties: { roughness: 0.9, metalness: 0 }
  }
]

// Material presets with complete configurations
export interface MaterialPreset {
  id: string
  name: string
  icon?: string
  color: string
  roughness: number
  metalness: number
  transmission?: number
  ior?: number
  thickness?: number
  clearcoat?: number
  clearcoatRoughness?: number
  envMapIntensity: number
  textureId?: string
  normalScale?: number
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  // Metals
  {
    id: 'gold',
    name: 'Gold',
    color: '#FFD700',
    roughness: 0.3,
    metalness: 1,
    envMapIntensity: 1.5
  },
  {
    id: 'silver',
    name: 'Silver',
    color: '#C0C0C0',
    roughness: 0.2,
    metalness: 1,
    envMapIntensity: 1.8
  },
  {
    id: 'copper',
    name: 'Copper',
    color: '#B87333',
    roughness: 0.4,
    metalness: 1,
    envMapIntensity: 1.2
  },
  
  // Glass & Transparent
  {
    id: 'glass-clear',
    name: 'Clear Glass',
    color: '#FFFFFF',
    roughness: 0.05,
    metalness: 0,
    transmission: 1,
    ior: 1.5,
    thickness: 0.5,
    envMapIntensity: 0.8
  },
  {
    id: 'glass-tinted',
    name: 'Tinted Glass',
    color: '#4A90E2',
    roughness: 0.1,
    metalness: 0,
    transmission: 0.9,
    ior: 1.45,
    thickness: 0.8,
    envMapIntensity: 0.6
  },
  {
    id: 'acrylic',
    name: 'Acrylic',
    color: '#E6F2FF',
    roughness: 0.2,
    metalness: 0,
    transmission: 0.8,
    ior: 1.49,
    thickness: 1,
    envMapIntensity: 0.4
  },
  
  // Ceramics
  {
    id: 'porcelain',
    name: 'Porcelain',
    color: '#F8F8F8',
    roughness: 0.15,
    metalness: 0,
    envMapIntensity: 0.6,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1
  },
  {
    id: 'clay',
    name: 'Clay',
    color: '#CD853F',
    roughness: 0.9,
    metalness: 0,
    envMapIntensity: 0.1
  },
  
  // Fabrics
  {
    id: 'velvet',
    name: 'Velvet',
    color: '#4B0082',
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.05
  },
  {
    id: 'silk',
    name: 'Silk',
    color: '#FFF5EE',
    roughness: 0.3,
    metalness: 0,
    envMapIntensity: 0.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.8
  },
  
  // Plastics
  {
    id: 'plastic-glossy',
    name: 'Glossy Plastic',
    color: '#FF6B6B',
    roughness: 0.2,
    metalness: 0,
    envMapIntensity: 0.4,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1
  },
  {
    id: 'rubber',
    name: 'Rubber',
    color: '#2C2C2C',
    roughness: 0.9,
    metalness: 0,
    envMapIntensity: 0.1
  }
]
