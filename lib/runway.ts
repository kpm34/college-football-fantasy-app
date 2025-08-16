// Runway AI Video Generation Integration
// Documentation: https://docs.runwayml.com/reference/

const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || '';

if (!RUNWAY_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('RUNWAY_API_KEY not set - Runway AI features will be disabled');
}

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

/**
 * Create a new Runway AI video generation job
 */
export async function createRunwayJob(input: CreateRunwayJobInput): Promise<{ jobId: string }> {
  if (!RUNWAY_API_KEY) {
    throw new Error('Runway AI integration not configured');
  }

  try {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      },
      body: JSON.stringify({
        taskType: 'gen3',
        internal: false,
        options: {
          name: 'College Football Fantasy Video',
          seconds: input.duration || 5,
          gen3a_options: {
            exploreMode: true,
            seed: input.seed || Math.floor(Math.random() * 1000000),
            watermark: input.watermark !== false,
            aspectRatio: input.aspectRatio || '16:9',
            text_prompt: input.prompt,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Runway API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return { jobId: data.id };
  } catch (error) {
    console.error('Failed to create Runway job:', error);
    throw new Error('Failed to start video generation');
  }
}

/**
 * Poll Runway AI job status
 */
export async function pollRunwayJob(jobId: string): Promise<{
  status: 'RUNNING' | 'FAILED' | 'COMPLETE';
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  progress?: number;
}> {
  if (!RUNWAY_API_KEY) {
    throw new Error('Runway AI integration not configured');
  }

  try {
    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Runway API error: ${response.status} - ${error}`);
    }

    const data: RunwayJobResponse = await response.json();

    // Map Runway status to our internal status
    if (data.status === 'succeeded' && data.artifacts?.video) {
      return {
        status: 'COMPLETE',
        videoUrl: data.artifacts.video,
        thumbnailUrl: data.artifacts.thumbnail,
        progress: 100,
      };
    } else if (data.status === 'failed') {
      return {
        status: 'FAILED',
        error: data.error || 'Video generation failed',
        progress: data.progress || 0,
      };
    } else {
      return {
        status: 'RUNNING',
        progress: data.progress || 0,
      };
    }
  } catch (error) {
    console.error('Failed to poll Runway job:', error);
    throw new Error('Failed to check video generation status');
  }
}

/**
 * Cancel a Runway AI job
 */
export async function cancelRunwayJob(jobId: string): Promise<void> {
  if (!RUNWAY_API_KEY) {
    return;
  }

  try {
    await fetch(`${RUNWAY_API_BASE}/tasks/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      },
    });
  } catch (error) {
    console.error('Failed to cancel Runway job:', error);
  }
}

/**
 * Get user's Runway AI credits/usage
 */
export async function getRunwayUsage(): Promise<{
  creditsUsed: number;
  creditsRemaining: number;
  planType: string;
}> {
  if (!RUNWAY_API_KEY) {
    throw new Error('Runway AI integration not configured');
  }

  try {
    const response = await fetch(`${RUNWAY_API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch usage data');
    }

    const data = await response.json();
    return {
      creditsUsed: data.creditsUsed || 0,
      creditsRemaining: data.creditsRemaining || 0,
      planType: data.plan || 'free',
    };
  } catch (error) {
    console.error('Failed to get Runway usage:', error);
    throw error;
  }
}

/**
 * Check if Runway AI is configured and available
 */
export function isRunwayAvailable(): boolean {
  return !!RUNWAY_API_KEY;
}