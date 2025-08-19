import { NextRequest, NextResponse } from 'next/server';
import { Client as ServerClient, Databases as ServerDatabases, Users as ServerUsers } from 'node-appwrite';
import { env } from '@/core/config/environment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      envVars: {
        status: 'pending',
        details: {} as any
      },
      appwriteConnection: {
        status: 'pending',
        details: {} as any
      },
      databaseAccess: {
        status: 'pending',
        details: {} as any
      },
      collectionList: {
        status: 'pending',
        details: {} as any
      },
      authService: {
        status: 'pending',
        details: {} as any
      },
      documentCreation: {
        status: 'pending',
        details: {} as any
      }
    }
  };

  try {
    // CHECKPOINT 1: Environment Variables
    console.log('🔍 Checkpoint 1: Checking environment variables...');
    const envCheck = {
      NEXT_PUBLIC_APPWRITE_ENDPOINT: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT_ID: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      APPWRITE_API_KEY: !!process.env.APPWRITE_API_KEY,
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'NOT SET',
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'NOT SET',
      databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'NOT SET',
      apiKeyLength: process.env.APPWRITE_API_KEY?.length || 0
    };
    
    results.checks.envVars.status = envCheck.APPWRITE_API_KEY ? 'success' : 'failed';
    results.checks.envVars.details = envCheck;
    
    if (!process.env.APPWRITE_API_KEY) {
      throw new Error('APPWRITE_API_KEY is not set');
    }

    // CHECKPOINT 2: Appwrite Client Connection
    console.log('🔍 Checkpoint 2: Creating Appwrite client...');
    const client = new ServerClient();
    
    try {
      client
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'college-football-fantasy-app')
        .setKey(process.env.APPWRITE_API_KEY);
      
      results.checks.appwriteConnection.status = 'success';
      results.checks.appwriteConnection.details = {
        endpoint: client.config?.endpoint,
        project: client.config?.project,
        hasApiKey: !!client.config?.key
      };
    } catch (error: any) {
      results.checks.appwriteConnection.status = 'failed';
      results.checks.appwriteConnection.details = {
        error: error.message,
        stack: error.stack
      };
      throw error;
    }

    // CHECKPOINT 3: Database Service
    console.log('🔍 Checkpoint 3: Testing database service...');
    const databases = new ServerDatabases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'college-football-fantasy';
    
    try {
      // Try to list databases (this will fail if API key is invalid)
      const dbList = await databases.list();
      results.checks.databaseAccess.status = 'success';
      results.checks.databaseAccess.details = {
        totalDatabases: dbList.total,
        databases: dbList.databases.map(db => ({
          id: db.$id,
          name: db.name
        }))
      };
    } catch (error: any) {
      results.checks.databaseAccess.status = 'failed';
      results.checks.databaseAccess.details = {
        error: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      };
      // Don't throw here, continue with other checks
    }

    // CHECKPOINT 4: Collection Access
    console.log('🔍 Checkpoint 4: Testing collection access...');
    try {
      const collections = await databases.listCollections(databaseId);
      results.checks.collectionList.status = 'success';
      results.checks.collectionList.details = {
        totalCollections: collections.total,
        collections: collections.collections.map(c => ({
          id: c.$id,
          name: c.name,
          documentCount: c.total
        }))
      };
    } catch (error: any) {
      results.checks.collectionList.status = 'failed';
      results.checks.collectionList.details = {
        error: error.message,
        code: error.code,
        type: error.type,
        databaseId: databaseId
      };
    }

    // CHECKPOINT 5: Auth Service (Users)
    console.log('🔍 Checkpoint 5: Testing auth service...');
    try {
      const users = new ServerUsers(client);
      const userList = await users.list([], 1); // Get just 1 user to test
      results.checks.authService.status = 'success';
      results.checks.authService.details = {
        totalUsers: userList.total,
        canAccessUsers: true
      };
    } catch (error: any) {
      results.checks.authService.status = 'failed';
      results.checks.authService.details = {
        error: error.message,
        code: error.code,
        type: error.type
      };
    }

    // CHECKPOINT 6: Test Document Creation (in activity_log)
    console.log('🔍 Checkpoint 6: Testing document creation...');
    try {
      const testDoc = await databases.createDocument(
        databaseId,
        'activity_log',
        'unique()',
        {
          action: 'connection_test',
          timestamp: new Date().toISOString(),
          userId: 'system',
          details: JSON.stringify({
            source: 'debug-api',
            environment: process.env.NODE_ENV
          })
        }
      );
      
      // Clean up test document
      await databases.deleteDocument(databaseId, 'activity_log', testDoc.$id);
      
      results.checks.documentCreation.status = 'success';
      results.checks.documentCreation.details = {
        testDocId: testDoc.$id,
        deleted: true
      };
    } catch (error: any) {
      results.checks.documentCreation.status = 'failed';
      results.checks.documentCreation.details = {
        error: error.message,
        code: error.code,
        type: error.type,
        collection: 'activity_log'
      };
    }

    // Overall status
    const allChecks = Object.values(results.checks);
    const failedChecks = allChecks.filter(c => c.status === 'failed');
    const successChecks = allChecks.filter(c => c.status === 'success');
    
    const overallStatus = failedChecks.length === 0 ? 'healthy' : 
                          successChecks.length === 0 ? 'critical' : 'degraded';

    return NextResponse.json({
      ...results,
      summary: {
        status: overallStatus,
        totalChecks: allChecks.length,
        passed: successChecks.length,
        failed: failedChecks.length,
        failedCheckNames: failedChecks.map((_, i) => Object.keys(results.checks)[i])
      }
    }, { 
      status: overallStatus === 'healthy' ? 200 : 500 
    });

  } catch (error: any) {
    console.error('❌ Debug test failed:', error);
    return NextResponse.json({
      ...results,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.type
      },
      summary: {
        status: 'critical',
        message: 'Connection test failed with critical error'
      }
    }, { status: 500 });
  }
}
