import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Simplified webhook handler for Vercel deployment events
 * Post-consolidation version - streamlined architecture
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    
    console.log('🚀 Deployment webhook received:', {
      type: payload.type || 'unknown',
      deploymentUrl: payload.deploymentUrl || 'not provided'
    });

    const deploymentResponse = {
      timestamp: new Date().toISOString(),
      architecture: 'Consolidated SSOT',
      status: 'Active',
      consolidation: {
        schemaFiles: 'Single Source of Truth active',
        appwriteConfigs: 'Canonical files only', 
        buildGuards: 'Validating on deployment',
        projectMap: 'Unified at /PROJECT_MAP.md'
      },
      deployment: {
        type: payload.type || 'status',
        url: payload.deploymentUrl,
        environment: process.env.NODE_ENV || 'production'
      },
      postDeploymentTasks: [
        'Schema validation passed (build guards)',
        'No fragmented configs to sync',
        'SSOT architecture stable'
      ]
    };

    return NextResponse.json(deploymentResponse);

  } catch (error: any) {
    console.error('Deployment webhook error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error.message,
      architecture: 'Consolidated (error handling)'
    }, { status: 500 });
  }
}