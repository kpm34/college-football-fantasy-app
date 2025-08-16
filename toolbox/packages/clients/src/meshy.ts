// <toolbox:BEGIN toolbox/packages/clients/src/meshy.ts v2>
const MESHY_API_BASE = 'https://api.meshy.ai/v2';
const MESHY_API_KEY = process.env.MESHY_API_KEY || '';

export type TextureStyle = 'stylized' | 'pbr' | 'cartoon' | 'realistic';

export interface CreateMeshyJobInput {
  prompt?: string;
  baseTemplateGlbUrl?: string;
  textureStyle?: TextureStyle;
  negativePrompt?: string;
  artStyle?: string;
  seed?: number;
}

export interface MeshyJobResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  progress?: number;
  assets?: {
    glb?: string;
    preview?: string;
    textures?: {
      baseColor?: string;
      normal?: string;
      metallic?: string;
      roughness?: string;
    };
  };
  error?: string;
  createdAt?: string;
  completedAt?: string;
}

export function isAvailable(): boolean {
  return !!MESHY_API_KEY;
}

export async function create(input: CreateMeshyJobInput): Promise<{ jobId: string }> {
  if (!MESHY_API_KEY) throw new Error('MESHY_API_KEY missing');

  const body = {
    mode: input.baseTemplateGlbUrl ? 'refine' : 'generate',
    prompt: input.prompt || 'A mascot',
    negative_prompt: input.negativePrompt,
    art_style: input.artStyle || 'cartoon',
    texture_style: input.textureStyle || 'stylized',
    seed: input.seed,
    ...(input.baseTemplateGlbUrl && { model_url: input.baseTemplateGlbUrl })
  } as Record<string, unknown>;

  const res = await fetch(`${MESHY_API_BASE}/text-to-3d`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MESHY_API_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy create failed: ${res.status} - ${err}`);
  }
  const data = await res.json();
  return { jobId: data.result as string };
}

export async function poll(jobId: string): Promise<{
  status: 'RUNNING' | 'FAILED' | 'COMPLETE';
  glbUrl?: string;
  previewImgUrl?: string;
  error?: string;
  progress?: number;
}> {
  if (!MESHY_API_KEY) throw new Error('MESHY_API_KEY missing');

  const res = await fetch(`${MESHY_API_BASE}/text-to-3d/${jobId}`, {
    headers: { 'Authorization': `Bearer ${MESHY_API_KEY}` }
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meshy poll failed: ${res.status} - ${err}`);
  }
  const data = await res.json() as MeshyJobResponse;

  if (data.status === 'succeeded' && data.assets?.glb) {
    return { status: 'COMPLETE', glbUrl: data.assets.glb, previewImgUrl: data.assets.preview, progress: 100 };
  }
  if (data.status === 'failed') {
    return { status: 'FAILED', error: data.error || 'Generation failed', progress: data.progress || 0 };
  }
  return { status: 'RUNNING', progress: data.progress || 0 };
}

export async function cancel(jobId: string): Promise<void> {
  if (!MESHY_API_KEY) return;
  try {
    await fetch(`${MESHY_API_BASE}/text-to-3d/${jobId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${MESHY_API_KEY}` }
    });
  } catch {
    // swallow
  }
}
// <toolbox:END toolbox/packages/clients/src/meshy.ts v2>
