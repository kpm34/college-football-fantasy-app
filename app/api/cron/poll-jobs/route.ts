import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases as databases } from '@lib/appwrite-server';
import { DATABASE_ID } from '@lib/appwrite';
import { Query } from 'node-appwrite';
// import { pollMeshyJob } from '@/vendor/awwwards-rig/src/lib/meshy'; // Removed with vendor directory
import { pollRunwayJob } from '@lib/runway';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

// Collection IDs for different job types
const JOB_COLLECTIONS = {
  meshy: 'meshy_jobs',
  runway: 'runway_jobs',
  blender: 'blender_jobs',
} as const;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('🎬 Starting job polling cron...');

    const results: any[] = [];
    const errors: any[] = [];

    // Poll each job type
    for (const [provider, collectionId] of Object.entries(JOB_COLLECTIONS)) {
      try {
        const jobResults = await pollJobsForProvider(provider as keyof typeof JOB_COLLECTIONS, collectionId);
        results.push(...jobResults);
        console.log(`✅ Polled ${jobResults.length} ${provider} jobs`);
      } catch (error) {
        console.error(`❌ Error polling ${provider} jobs:`, error);
        errors.push({ provider, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    const summary = {
      success: errors.length === 0,
      totalJobsPolled: results.length,
      completedJobs: results.filter(r => r.status === 'COMPLETE').length,
      failedJobs: results.filter(r => r.status === 'FAILED').length,
      runningJobs: results.filter(r => r.status === 'RUNNING').length,
      errors,
      timestamp: new Date().toISOString(),
    };

    console.log('📊 Job polling summary:', summary);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error('Cron job polling error:', error);
    return NextResponse.json(
      { error: 'Job polling failed', message: error.message },
      { status: 500 }
    );
  }
}

async function pollJobsForProvider(provider: keyof typeof JOB_COLLECTIONS, collectionId: string) {
  const results: any[] = [];

  try {
    // Get running/queued jobs for this provider
    const response = await databases.listDocuments(
      DATABASE_ID,
      collectionId,
      [
        Query.or([
          Query.equal('status', 'QUEUED'),
          Query.equal('status', 'RUNNING'),
        ]),
        Query.orderDesc('$createdAt'),
        Query.limit(50), // Limit to prevent timeouts
      ]
    );

    console.log(`Found ${response.documents.length} pending ${provider} jobs`);

    // Poll each job
    for (const job of response.documents) {
      try {
        const jobResult = await pollSingleJob(provider, job);
        if (jobResult) {
          results.push(jobResult);
        }
      } catch (error) {
        console.error(`Error polling ${provider} job ${job.$id}:`, error);
        
        // Mark job as failed after too many polling errors
        await databases.updateDocument(
          DATABASE_ID,
          collectionId,
          job.$id,
          {
            status: 'FAILED',
            error: error instanceof Error ? error.message : 'Polling failed',
            updatedAt: new Date().toISOString(),
          }
        );

        results.push({
          jobId: job.$id,
          provider,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Polling failed',
        });
      }
    }
  } catch (error) {
    console.error(`Failed to fetch ${provider} jobs:`, error);
    throw error;
  }

  return results;
}

async function pollSingleJob(provider: keyof typeof JOB_COLLECTIONS, job: any) {
  const collectionId = JOB_COLLECTIONS[provider];
  const providerId = job.providerId || job.jobId;

  if (!providerId) {
    console.warn(`No provider ID found for ${provider} job ${job.$id}`);
    return null;
  }

  let pollResult;

  // Poll the appropriate provider
  switch (provider) {
    case 'meshy':
      // pollResult = await pollMeshyJob(providerId); // Removed with vendor directory
      console.log('Meshy polling disabled - vendor directory removed');
      return null;
    case 'runway':
      pollResult = await pollRunwayJob(providerId);
      break;
    case 'blender':
      // Blender jobs are handled locally, skip polling external API
      return null;
    default:
      console.warn(`Unknown provider: ${provider}`);
      return null;
  }

  // Update job status if changed
  if (pollResult.status !== job.status) {
    const updateData: any = {
      status: pollResult.status,
      updatedAt: new Date().toISOString(),
    };

    // Add completion data
    if (pollResult.status === 'COMPLETE') {
      updateData.completedAt = new Date().toISOString();
      
      if (provider === 'meshy' && pollResult.glbUrl) {
        updateData.resultUrl = pollResult.glbUrl;
        updateData.previewUrl = pollResult.previewImgUrl;
      } else if (provider === 'runway' && pollResult.videoUrl) {
        updateData.resultUrl = pollResult.videoUrl;
        updateData.thumbnailUrl = pollResult.thumbnailUrl;
      }
    } else if (pollResult.status === 'FAILED') {
      updateData.error = pollResult.error || 'Generation failed';
    }

    // Add progress if available
    if (pollResult.progress !== undefined) {
      updateData.progress = pollResult.progress;
    }

    await databases.updateDocument(DATABASE_ID, collectionId, job.$id, updateData);

    console.log(`Updated ${provider} job ${job.$id}: ${job.status} → ${pollResult.status}`);
  }

  return {
    jobId: job.$id,
    provider,
    status: pollResult.status,
    progress: pollResult.progress,
    resultUrl: pollResult.status === 'COMPLETE' ? 
      (provider === 'meshy' ? pollResult.glbUrl : pollResult.videoUrl) : undefined,
  };
}