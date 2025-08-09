// lib/edgeConfig.ts
import { get as getFromEdgeConfig } from '@vercel/edge-config'

export type Flags = {
  enableWebGL: boolean
  heroVariant: '3d' | 'static'
  chatEnabled: boolean
}

export async function getFlag<K extends keyof Flags>(key: K): Promise<Flags[K]> {
  const value = await getFromEdgeConfig<Flags[K]>(key as string)
  return value as Flags[K]
}


