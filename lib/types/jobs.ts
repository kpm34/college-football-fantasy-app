// Job Management Types
// Unified type system for async job processing across providers

export type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETE' | 'FAILED';
export type JobProvider = 'meshy' | 'runway' | 'blender' | 'openai';

/**
 * Base job interface - all job types extend this
 */
export interface BaseJob {
  id: string;
  status: JobStatus;
  provider: JobProvider;
  providerId: string; // External provider's job ID
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  error?: string;
  progress?: number; // 0-100
  clientId?: string;
  metadata?: Record<string, any>;
  webhookSecret?: string;
}

/**
 * Meshy AI 3D generation job
 */
export interface MeshyJob extends BaseJob {
  provider: 'meshy';
  mode: 'text-to-3d' | 'image-to-3d' | 'refine';
  prompt?: string;
  imageUrl?: string;
  baseModelUrl?: string;
  textureStyle?: 'stylized' | 'pbr' | 'cartoon' | 'realistic';
  negativePrompt?: string;
  artStyle?: string;
  seed?: number;
  // Results
  resultUrl?: string; // GLB file URL
  previewUrl?: string; // Preview image URL
  textures?: {
    baseColor?: string;
    normal?: string;
    metallic?: string;
    roughness?: string;
  };
}

/**
 * Runway AI video generation job
 */
export interface RunwayJob extends BaseJob {
  provider: 'runway';
  prompt: string;
  model: 'gen3' | 'gen2';
  duration: number; // seconds
  aspectRatio: '16:9' | '9:16' | '1:1';
  seed?: number;
  watermark?: boolean;
  // Results
  resultUrl?: string; // Video URL
  thumbnailUrl?: string; // Thumbnail image URL
}

/**
 * Blender rendering job
 */
export interface BlenderJob extends BaseJob {
  provider: 'blender';
  operation: 'render' | 'export' | 'process';
  inputFile?: string;
  outputFormat: 'glb' | 'fbx' | 'obj' | 'usd' | 'mp4' | 'png';
  renderSettings?: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    samples?: number;
    resolution?: [number, number];
  };
  // Results
  resultUrl?: string; // Output file URL
  logUrl?: string; // Render log URL
}

/**
 * OpenAI job (for DALL-E image generation or other async operations)
 */
export interface OpenAIJob extends BaseJob {
  provider: 'openai';
  operation: 'image-generation' | 'embedding' | 'moderation';
  prompt?: string;
  model?: string;
  // Image generation specific
  imageSize?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
  imageQuality?: 'standard' | 'hd';
  imageStyle?: 'vivid' | 'natural';
  // Results
  resultUrl?: string; // Generated image URL
  revisedPrompt?: string; // DALL-E revised prompt
}

/**
 * Union type for all job types
 */
export type Job = MeshyJob | RunwayJob | BlenderJob | OpenAIJob;

/**
 * Job creation input types
 */
export interface CreateJobInput {
  provider: JobProvider;
  clientId?: string;
  metadata?: Record<string, any>;
  webhookSecret?: string;
}

export interface CreateMeshyJobInput extends CreateJobInput {
  provider: 'meshy';
  mode?: 'text-to-3d' | 'image-to-3d' | 'refine';
  prompt?: string;
  imageUrl?: string;
  baseModelUrl?: string;
  textureStyle?: 'stylized' | 'pbr' | 'cartoon' | 'realistic';
  negativePrompt?: string;
  artStyle?: string;
  seed?: number;
}

export interface CreateRunwayJobInput extends CreateJobInput {
  provider: 'runway';
  prompt: string;
  model?: 'gen3' | 'gen2';
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  seed?: number;
  watermark?: boolean;
}

export interface CreateBlenderJobInput extends CreateJobInput {
  provider: 'blender';
  operation: 'render' | 'export' | 'process';
  inputFile?: string;
  outputFormat: 'glb' | 'fbx' | 'obj' | 'usd' | 'mp4' | 'png';
  renderSettings?: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    samples?: number;
    resolution?: [number, number];
  };
}

export interface CreateOpenAIJobInput extends CreateJobInput {
  provider: 'openai';
  operation: 'image-generation' | 'embedding' | 'moderation';
  prompt?: string;
  model?: string;
  imageSize?: '1024x1024' | '1792x1024' | '1024x1792' | '512x512' | '256x256';
  imageQuality?: 'standard' | 'hd';
  imageStyle?: 'vivid' | 'natural';
}

export type CreateJobInputVariant = 
  | CreateMeshyJobInput 
  | CreateRunwayJobInput 
  | CreateBlenderJobInput 
  | CreateOpenAIJobInput;

/**
 * Job polling result types
 */
export interface JobPollResult {
  status: JobStatus;
  progress?: number;
  error?: string;
  resultUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Job query filters
 */
export interface JobFilters {
  provider?: JobProvider;
  status?: JobStatus;
  clientId?: string;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
}

/**
 * Job statistics
 */
export interface JobStats {
  total: number;
  byStatus: Record<JobStatus, number>;
  byProvider: Record<JobProvider, number>;
  averageCompletionTime: number; // milliseconds
  successRate: number; // percentage
}