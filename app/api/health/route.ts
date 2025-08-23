import { NextRequest, NextResponse } from 'next/server';
import { serverDatabases, serverUsers, isServerConfigured, DATABASE_ID, COLLECTIONS } from '@lib/appwrite-server';
import { Query } from 'node-appwrite';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    appwrite: {
      status: boolean;
      configured: boolean;
      database: boolean;
      collections: Record<string, boolean>;
      error?: string;
    };
    vercel: {
      status: boolean;
      environment: string;
      region: string;
      kv?: {
        status: boolean;
        error?: string;
      };
    };
    environment: {
      hasApiKey: boolean;
      hasEndpoint: boolean;
      hasProjectId: boolean;
      hasDatabaseId: boolean;
    };
  };
}

export async function GET(request: NextRequest) {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      appwrite: {
        status: false,
        configured: isServerConfigured(),
        database: false,
        collections: {},
      },
      vercel: {
        status: true,
        environment: process.env.VERCEL_ENV || 'development',
        region: process.env.VERCEL_REGION || 'unknown',
      },
      environment: {
        hasApiKey: !!process.env.APPWRITE_API_KEY,
        hasEndpoint: !!process.env.APPWRITE_ENDPOINT,
        hasProjectId: !!process.env.APPWRITE_PROJECT_ID,
        hasDatabaseId: !!DATABASE_ID,
      },
    },
  };

  // Check Appwrite connection
  if (isServerConfigured()) {
    try {
      // Test database connection by listing one document
      const testQuery = await serverDatabases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.LEAGUES,
        [Query.limit(1)]
      );
      
      health.services.appwrite.status = true;
      health.services.appwrite.database = true;

      // Check each collection exists
      for (const [name, id] of Object.entries(COLLECTIONS)) {
        try {
          await serverDatabases.listDocuments(DATABASE_ID, id, [Query.limit(1)]);
          health.services.appwrite.collections[name] = true;
        } catch (error) {
          health.services.appwrite.collections[name] = false;
          health.status = 'degraded';
        }
      }
    } catch (error: any) {
      health.services.appwrite.status = false;
      health.services.appwrite.error = error.message || 'Failed to connect to Appwrite';
      health.status = 'unhealthy';
    }
  } else {
    health.services.appwrite.error = 'Server not configured';
    health.status = 'unhealthy';
  }

  // Check Vercel KV if available
  try {
    if (process.env.KV_REST_API_URL) {
      await kv.ping();
      health.services.vercel.kv = { status: true };
    }
  } catch (error: any) {
    health.services.vercel.kv = { 
      status: false, 
      error: error.message || 'KV connection failed' 
    };
    health.status = health.status === 'healthy' ? 'degraded' : health.status;
  }

  // Determine overall health
  const isHealthy = health.services.appwrite.status && health.services.vercel.status;
  health.status = isHealthy ? 'healthy' : health.status;
  // Add simple ok boolean for quick probes
  const ok = health.status === 'healthy';

  // Add cache headers
  return NextResponse.json({ ok, ...health }, {
    status: ok ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Status': health.status,
    },
  });
}
