/**
 * Consolidated Edge Config Feature Flags System
 * Single source of truth for all feature flags and configuration
 */

import { get, getAll, has } from '@vercel/edge-config'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FeatureFlags {
  // Core Features
  enableWebGL: boolean
  heroVariant: '3d' | 'static' | 'video'
  chatEnabled: boolean
  
  // Performance Settings
  webglQuality: 'low' | 'medium' | 'high' | 'ultra'
  enablePostProcessing: boolean
  maxDPR: number
  
  // AI Configuration
  aiProvider: 'anthropic' | 'openai' | 'gemini'
  aiModel: string
  maxTokens: number
  
  // System Controls
  maintenanceMode: boolean
  apiRateLimitMultiplier: number
  enableAnalytics: boolean
  enableErrorReporting: boolean
}

// Default values for all flags
export const DEFAULT_FLAGS: FeatureFlags = {
  // Core
  enableWebGL: true,
  heroVariant: '3d',
  chatEnabled: true,
  
  // Performance
  webglQuality: 'high',
  enablePostProcessing: true,
  maxDPR: 2,
  
  // AI
  aiProvider: 'anthropic',
  aiModel: 'claude-3-5-sonnet-20241022',
  maxTokens: 1024,
  
  // System
  maintenanceMode: false,
  apiRateLimitMultiplier: 1,
  enableAnalytics: true,
  enableErrorReporting: true,
}

// ============================================================================
// SERVER-SIDE UTILITIES (for middleware, API routes, SSR)
// ============================================================================

/**
 * Get a single feature flag (server-side)
 */
export async function getFlag<K extends keyof FeatureFlags>(
  key: K
): Promise<FeatureFlags[K]> {
  try {
    if (!process.env.EDGE_CONFIG) return DEFAULT_FLAGS[key]
    const value = (await get(key)) as unknown as FeatureFlags[K] | null | undefined
    return value ?? DEFAULT_FLAGS[key]
  } catch (error) {
    console.warn(`Edge Config error for "${key}":`, error)
    return DEFAULT_FLAGS[key]
  }
}

/**
 * Get all feature flags (server-side)
 */
export async function getAllFlags(): Promise<FeatureFlags> {
  try {
    if (!process.env.EDGE_CONFIG) return DEFAULT_FLAGS
    const flags = await getAll<FeatureFlags>()
    return { ...DEFAULT_FLAGS, ...flags }
  } catch (error) {
    console.warn('Edge Config error:', error)
    return DEFAULT_FLAGS
  }
}

/**
 * Check if flag exists (server-side)
 */
export async function hasFlag(key: keyof FeatureFlags): Promise<boolean> {
  try {
    if (!process.env.EDGE_CONFIG) return false
    return await has(key)
  } catch {
    return false
  }
}

// ============================================================================
// SPECIALIZED GETTERS
// ============================================================================

/**
 * Get WebGL configuration based on device and flags
 */
export async function getWebGLConfig() {
  const flags = await getAllFlags()
  
  // Device detection (server-side safe)
  const userAgent = typeof window !== 'undefined' ? navigator.userAgent : ''
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent)
  
  // Adjust quality for mobile
  let quality = flags.webglQuality
  if (isMobile && quality === 'ultra') {
    quality = 'high'
  }
  
  return {
    enabled: flags.enableWebGL && !flags.maintenanceMode,
    quality,
    postProcessing: flags.enablePostProcessing && quality !== 'low',
    dpr: Math.min(flags.maxDPR, isMobile ? 1 : 2),
    antialias: quality !== 'low',
    shadows: quality === 'high' || quality === 'ultra',
    powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
  }
}

/**
 * Get AI configuration
 */
export async function getAIConfig() {
  const flags = await getAllFlags()
  return {
    enabled: flags.chatEnabled && !flags.maintenanceMode,
    provider: flags.aiProvider,
    model: flags.aiModel,
    maxTokens: flags.maxTokens,
  }
}

// ============================================================================
// QUICK ACCESS UTILITIES
// ============================================================================

/**
 * Check if a feature is enabled (client-safe)
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  // This is a sync check against defaults, useful for initial render
  return DEFAULT_FLAGS[flag] as boolean
}