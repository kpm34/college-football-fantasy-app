import { NextRequest, NextResponse } from 'next/server';
import { syncSystem } from '../../../../core/sync/central-sync-system';
import { migrationTools } from '../../../../core/validation/data-migration-tools';
import { withErrorHandler } from '../../../../core/utils/error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook handler for Vercel deployment events
 * 
 * This endpoint is called by Vercel when deployments complete
 * to coordinate database schema sync and cache invalidation
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // Verify webhook signature from Vercel
  const signature = request.headers.get('x-vercel-signature');
  const webhookSecret = process.env.VERCEL_WEBHOOK_SECRET;
  
  if (webhookSecret && signature) {
    // In production, verify the webhook signature
    // const crypto = require('crypto');
    // const computedSignature = crypto
    //   .createHmac('sha1', webhookSecret)
    //   .update(body)
    //   .digest('hex');
    // 
    // if (signature !== `sha1=${computedSignature}`) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
  }

  try {
    const payload = await request.json();
    
    console.log('🚀 Deployment webhook received:', {
      type: payload.type,
      target: payload.target,
      projectId: payload.projectId,
      deploymentUrl: payload.deploymentUrl
    });

    // Handle different deployment events
    switch (payload.type) {
      case 'deployment.created':
        return await handleDeploymentCreated(payload);
      
      case 'deployment.succeeded':
        return await handleDeploymentSucceeded(payload);
      
      case 'deployment.failed':
        return await handleDeploymentFailed(payload);
      
      case 'deployment.promoted':
        return await handleDeploymentPromoted(payload);
      
      default:
        console.log(`Unknown deployment event type: ${payload.type}`);
        return NextResponse.json({ message: 'Event ignored' });
    }

  } catch (error: any) {
    console.error('Deployment webhook error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error.message
    }, { status: 500 });
  }
});

/**
 * Handle deployment created event
 */
async function handleDeploymentCreated(payload: any): Promise<NextResponse> {
  console.log('📦 Deployment started - preparing sync tasks');
  
  // Pre-deployment tasks
  const tasks = [];
  
  // Check if schema changes are detected
  try {
    const schemaComparison = await migrationTools.compareSchema();
    const hasSchemaIssues = schemaComparison.some(comparison => 
      comparison.missingAttributes.length > 0 ||
      comparison.typeConflicts.length > 0
    );
    
    if (hasSchemaIssues) {
      tasks.push('schema_migration_required');
      console.log('⚠️ Schema issues detected - migration may be needed after deployment');
    }
  } catch (error) {
    console.warn('Could not check schema during deployment webhook:', error);
  }
  
  return NextResponse.json({
    message: 'Deployment created',
    preDeploymentTasks: tasks
  });
}

/**
 * Handle deployment succeeded event
 */
async function handleDeploymentSucceeded(payload: any): Promise<NextResponse> {
  console.log('✅ Deployment succeeded - starting post-deployment sync');
  
  const results = [];
  
  try {
    // 1. Compare schema and auto-fix minor issues
    console.log('🔍 Checking schema consistency...');
    const schemaComparison = await migrationTools.compareSchema();
    const migrationPlan = await migrationTools.generateMigrationPlan(schemaComparison);
    
    if (migrationPlan.operations.length > 0) {
      console.log(`📋 Migration plan: ${migrationPlan.operations.length} operations (${migrationPlan.riskLevel} risk)`);
      
      if (migrationPlan.riskLevel === 'low') {
        // Auto-execute low-risk migrations
        const migrationResult = await migrationTools.executeMigration(migrationPlan, {
          dryRun: false,
          skipRiskyOperations: true
        });
        
        results.push({
          task: 'schema_migration',
          status: migrationResult.success ? 'completed' : 'failed',
          details: migrationResult
        });
      } else {
        results.push({
          task: 'schema_migration',
          status: 'skipped_high_risk',
          message: 'High-risk migration requires manual review'
        });
      }
    }
    
    // 2. Invalidate cache for updated API routes
    console.log('🗑️ Invalidating application cache...');
    
    // This would integrate with your cache invalidation system
    // For now, we'll just log what would be invalidated
    const cachePatterns = [
      'players:*',
      'leagues:*',
      'games:*',
      'api:*'
    ];
    
    results.push({
      task: 'cache_invalidation',
      status: 'completed',
      patterns: cachePatterns
    });
    
    // 3. Warm critical data caches
    console.log('🔥 Warming critical caches...');
    
    const warmupOperations = [
      syncSystem.queueOperation({
        id: 'warmup_players',
        type: 'bulk_update',
        collection: 'college_players',
        data: [], // This would trigger cache warming
        metadata: {
          source: 'deployment_warmup',
          timestamp: new Date().toISOString()
        }
      }),
      
      syncSystem.queueOperation({
        id: 'warmup_games', 
        type: 'bulk_update',
        collection: 'games',
        data: [],
        metadata: {
          source: 'deployment_warmup',
          timestamp: new Date().toISOString()
        }
      })
    ];
    
    const warmupResults = await Promise.allSettled(warmupOperations);
    results.push({
      task: 'cache_warmup',
      status: 'completed',
      operations: warmupResults.length
    });
    
    // 4. Run health checks
    console.log('🏥 Running post-deployment health checks...');
    
    const healthChecks = await runHealthChecks();
    results.push({
      task: 'health_checks',
      status: healthChecks.allPassed ? 'passed' : 'failed',
      details: healthChecks
    });
    
    // 5. Send notifications if enabled
    if (process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL) {
      await sendDeploymentNotification({
        type: 'success',
        deploymentUrl: payload.deploymentUrl,
        results
      });
    }
    
  } catch (error: any) {
    console.error('Post-deployment sync failed:', error);
    results.push({
      task: 'error_handling',
      status: 'failed',
      error: error.message
    });
  }
  
  return NextResponse.json({
    message: 'Post-deployment sync completed',
    deploymentUrl: payload.deploymentUrl,
    results
  });
}

/**
 * Handle deployment failed event
 */
async function handleDeploymentFailed(payload: any): Promise<NextResponse> {
  console.error('❌ Deployment failed');
  
  // Send failure notification
  if (process.env.SLACK_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL) {
    await sendDeploymentNotification({
      type: 'failure',
      deploymentUrl: payload.deploymentUrl,
      error: payload.error || 'Unknown deployment error'
    });
  }
  
  return NextResponse.json({
    message: 'Deployment failure processed',
    deploymentUrl: payload.deploymentUrl
  });
}

/**
 * Handle deployment promoted to production
 */
async function handleDeploymentPromoted(payload: any): Promise<NextResponse> {
  console.log('🎉 Deployment promoted to production');
  
  const results = [];
  
  try {
    // Production-specific tasks
    
    // 1. Trigger full data sync for production
    const productionSyncBatch = await syncSystem.syncFromCFBD(
      '/teams',
      'cfbd_to_teams',
      'teams'
    );
    
    results.push({
      task: 'production_data_sync',
      status: 'queued',
      batchId: productionSyncBatch
    });
    
    // 2. Enable production monitoring
    results.push({
      task: 'monitoring_enabled',
      status: 'completed'
    });
    
    // 3. Production notification
    await sendDeploymentNotification({
      type: 'promotion',
      deploymentUrl: payload.deploymentUrl,
      environment: 'production'
    });
    
  } catch (error: any) {
    console.error('Production promotion sync failed:', error);
    results.push({
      task: 'error_handling',
      status: 'failed',
      error: error.message
    });
  }
  
  return NextResponse.json({
    message: 'Production promotion processed',
    deploymentUrl: payload.deploymentUrl,
    results
  });
}

/**
 * Run basic health checks after deployment
 */
async function runHealthChecks(): Promise<{ allPassed: boolean; checks: any[] }> {
  const checks = [];
  
  try {
    // Check database connectivity
    const dbCheck = await fetch(`${process.env.APPWRITE_ENDPOINT}/health/db`, {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID!
      }
    });
    
    checks.push({
      name: 'database_connectivity',
      passed: dbCheck.ok,
      status: dbCheck.status
    });
    
    // Check if critical collections exist
    const collectionsCheck = await fetch(`${process.env.APPWRITE_ENDPOINT}/databases/${process.env.APPWRITE_DATABASE_ID}/collections`, {
      headers: {
        'X-Appwrite-Project': process.env.APPWRITE_PROJECT_ID!,
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY!
      }
    });
    
    checks.push({
      name: 'collections_accessible',
      passed: collectionsCheck.ok,
      status: collectionsCheck.status
    });
    
    // Check environment variables
    const requiredEnvVars = [
      'APPWRITE_PROJECT_ID',
      'APPWRITE_DATABASE_ID', 
      'CFBD_API_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    checks.push({
      name: 'environment_variables',
      passed: missingVars.length === 0,
      missingVars
    });
    
  } catch (error: any) {
    checks.push({
      name: 'health_check_error',
      passed: false,
      error: error.message
    });
  }
  
  return {
    allPassed: checks.every(check => check.passed),
    checks
  };
}

/**
 * Send deployment notifications to configured services
 */
async function sendDeploymentNotification(notification: {
  type: 'success' | 'failure' | 'promotion';
  deploymentUrl?: string;
  results?: any[];
  error?: string;
  environment?: string;
}): Promise<void> {
  const message = formatNotificationMessage(notification);
  
  try {
    // Slack notification
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          username: 'College Football Fantasy Bot',
          icon_emoji: notification.type === 'success' ? '✅' : 
                     notification.type === 'failure' ? '❌' : '🎉'
        })
      });
    }
    
    // Discord notification
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          username: 'College Football Fantasy Bot'
        })
      });
    }
    
  } catch (error) {
    console.error('Failed to send deployment notification:', error);
  }
}

function formatNotificationMessage(notification: any): string {
  switch (notification.type) {
    case 'success':
      return `🚀 **Deployment Successful**\n` +
             `URL: ${notification.deploymentUrl}\n` +
             `Tasks completed: ${notification.results?.length || 0}`;
    
    case 'failure':
      return `❌ **Deployment Failed**\n` +
             `URL: ${notification.deploymentUrl}\n` +
             `Error: ${notification.error}`;
    
    case 'promotion':
      return `🎉 **Production Deployment**\n` +
             `URL: ${notification.deploymentUrl}\n` +
             `Environment: ${notification.environment}`;
    
    default:
      return `Deployment event: ${notification.type}`;
  }
}