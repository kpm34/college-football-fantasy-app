import { NextRequest, NextResponse } from 'next/server';
import { syncSystem } from '../../../../core/sync/central-sync-system';
import { validationTools, migrationTools } from '../../../../core/validation/data-migration-tools';
import { DataPipelineVisualizer } from '../../../../core/pipeline/data-flow-map';
import { withErrorHandler } from '../../../../core/utils/error-handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (request: NextRequest) => {
  // Admin authentication check
  const sessionCookie = request.cookies.get('appwrite-session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get user info and check admin privileges
  const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
  const userResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
    headers: {
      'X-Appwrite-Project': 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0',
      'Cookie': cookieHeader,
    },
  });

  if (!userResponse.ok) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const user = await userResponse.json();
  
  // Check if user is admin (you may want to implement proper role checking)
  if (user.email !== 'kashpm2002@gmail.com') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // Get sync system status
    const syncStatus = {
      queueStats: syncSystem.getQueueStats(),
      activeJobs: syncSystem.getActiveJobs()
    };

    // Get schema comparison
    const schemaComparison = await migrationTools.compareSchema();
    const schemaSummary = {
      collectionsChecked: schemaComparison.length,
      issuesFound: schemaComparison.reduce((total, comparison) => 
        total + comparison.missingAttributes.length + 
        comparison.extraAttributes.length + 
        comparison.typeConflicts.length, 0
      ),
      details: schemaComparison
    };

    // Get data flow visualization
    const flowDiagram = DataPipelineVisualizer.generateMermaidDiagram();
    const syncChain = DataPipelineVisualizer.getSyncChain();

    const pipelineStatus = {
      timestamp: new Date().toISOString(),
      sync: syncStatus,
      schema: schemaSummary,
      dataFlow: {
        syncChain,
        diagram: flowDiagram
      },
      system: {
        version: '2.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
      }
    };

    return NextResponse.json(pipelineStatus);

  } catch (error: any) {
    console.error('Pipeline status error:', error);
    return NextResponse.json({
      error: 'Failed to get pipeline status',
      message: error.message
    }, { status: 500 });
  }
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  // Admin authentication check (same as GET)
  const sessionCookie = request.cookies.get('appwrite-session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const cookieHeader = `a_session_college-football-fantasy-app=${sessionCookie}`;
  const userResponse = await fetch('https://nyc.cloud.appwrite.io/v1/account', {
    headers: {
      'X-Appwrite-Project': 'college-football-fantasy-app',
      'X-Appwrite-Response-Format': '1.4.0',
      'Cookie': cookieHeader,
    },
  });

  if (!userResponse.ok) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const user = await userResponse.json();
  if (user.email !== 'kashpm2002@gmail.com') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'validate_collection': {
        const { collectionId, fixAutomatically = false } = params;
        const results = await validationTools.validateCollection(collectionId, {
          limit: 100,
          fixAutomatically,
          generateReport: true
        });
        
        return NextResponse.json({
          action,
          collectionId,
          results: {
            total: results.length,
            valid: results.filter(r => r.valid).length,
            invalid: results.filter(r => !r.valid).length,
            details: results.slice(0, 10) // Limit response size
          }
        });
      }

      case 'compare_schema': {
        const comparison = await migrationTools.compareSchema();
        return NextResponse.json({
          action,
          comparison,
          summary: {
            totalCollections: comparison.length,
            collectionsWithIssues: comparison.filter(c => 
              c.missingAttributes.length > 0 || 
              c.extraAttributes.length > 0 || 
              c.typeConflicts.length > 0
            ).length
          }
        });
      }

      case 'generate_migration': {
        const schemaComparison = await migrationTools.compareSchema();
        const migrationPlan = await migrationTools.generateMigrationPlan(schemaComparison);
        
        return NextResponse.json({
          action,
          migrationPlan,
          summary: {
            operations: migrationPlan.operations.length,
            estimatedDuration: migrationPlan.estimatedDuration,
            riskLevel: migrationPlan.riskLevel
          }
        });
      }

      case 'execute_migration': {
        const { migrationPlan, dryRun = true } = params;
        const result = await migrationTools.executeMigration(migrationPlan, { dryRun });
        
        return NextResponse.json({
          action,
          dryRun,
          result
        });
      }

      case 'sync_from_cfbd': {
        const { endpoint, transform, targetCollection } = params;
        const batchId = await syncSystem.syncFromCFBD(endpoint, transform, targetCollection);
        
        return NextResponse.json({
          action,
          batchId,
          status: 'queued'
        });
      }

      case 'get_batch_status': {
        const { batchId } = params;
        const status = syncSystem.getBatchStatus(batchId);
        
        return NextResponse.json({
          action,
          batchId,
          status
        });
      }

      default:
        return NextResponse.json({
          error: 'Unknown action',
          availableActions: [
            'validate_collection',
            'compare_schema', 
            'generate_migration',
            'execute_migration',
            'sync_from_cfbd',
            'get_batch_status'
          ]
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Pipeline action error:', error);
    return NextResponse.json({
      error: 'Pipeline action failed',
      message: error.message
    }, { status: 500 });
  }
});