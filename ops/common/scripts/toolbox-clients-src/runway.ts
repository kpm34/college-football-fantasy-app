// <toolbox:BEGIN toolbox/packages/clients/src/runway.ts v2>
const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || '';

export type RunwayModel = 'gen3' | 'gen2';
export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface CreateRunwayJobInput {
  prompt: string;
  model?: RunwayModel;
  duration?: number;
  aspectRatio?: AspectRatio;
  seed?: number;
  watermark?: boolean;
}

export interface RunwayJobResponse {
  id: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  progress?: number;
  artifacts?: {
    video?: string;
    thumbnail?: string;
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export function isAvailable(): boolean {
  return !!RUNWAY_API_KEY;
}

export async function create(input: CreateRunwayJobInput): Promise<{ jobId: string }> {
  if (!RUNWAY_API_KEY) throw new Error('RUNWAY_API_KEY missing');

  const response = await fetch(`${RUNWAY_API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RUNWAY_API_KEY}`,
    },
    body: JSON.stringify({
      taskType: input.model ?? 'gen3',
      internal: false,
      options: {
        name: 'Toolbox Video',
        seconds: input.duration ?? 5,
        gen3a_options: {
          exploreMode: true,
          seed: input.seed ?? Math.floor(Math.random() * 1000000),
          watermark: input.watermark !== false,
          aspectRatio: input.aspectRatio ?? '16:9',
          text_prompt: input.prompt,
        },
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Runway create failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return { jobId: data.id };
}

export async function poll(jobId: string): Promise<{
  status: 'RUNNING' | 'FAILED' | 'COMPLETE';
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  progress?: number;
}> {
  if (!RUNWAY_API_KEY) throw new Error('RUNWAY_API_KEY missing');

  const response = await fetch(`${RUNWAY_API_BASE}/tasks/${jobId}`, {
    headers: { 'Authorization': `Bearer ${RUNWAY_API_KEY}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Runway poll failed: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as RunwayJobResponse;

  if (data.status === 'succeeded' && data.artifacts?.video) {
    return {
      status: 'COMPLETE',
      videoUrl: data.artifacts.video,
      thumbnailUrl: data.artifacts.thumbnail,
      progress: 100,
    };
  }
  if (data.status === 'failed') {
    return { status: 'FAILED', error: data.error || 'Generation failed', progress: data.progress ?? 0 };
  }
  return { status: 'RUNNING', progress: data.progress ?? 0 };
}

export async function cancel(jobId: string): Promise<void> {
  if (!RUNWAY_API_KEY) return;
  try {
    await fetch(`${RUNWAY_API_BASE}/tasks/${jobId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${RUNWAY_API_KEY}` },
    });
  } catch {
    // swallow
  }
}
// <toolbox:END toolbox/packages/clients/src/runway.ts v2>
