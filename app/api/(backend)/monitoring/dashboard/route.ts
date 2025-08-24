/**
 * Monitoring Dashboard API
 * 
 * Provides monitoring metrics and alerts for internal dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

interface MonitoringDashboard {
  currentStatus: 'healthy' | 'degraded' | 'unhealthy';
  uptime: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  responseTime: {
    current: number;
    average24h: number;
    p95_24h: number;
  };
  activeAlerts: string[];
  recentIncidents: Array<{
    timestamp: string;
    status: string;
    duration: number;
    resolved: boolean;
  }>;
  systemMetrics: {
    totalRequests24h: number;
    errorRate24h: number;
    slowQueries: number;
    failedDeployments: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get current monitoring status
    const currentStatus = await kv.get('monitoring:latest') as any;
    
    // Calculate uptime metrics (simplified for demo)
    const uptimeMetrics = {
      last24h: 99.9,
      last7d: 99.8,
      last30d: 99.5
    };
    
    // Get response time metrics
    const responseTimeMetrics = {
      current: currentStatus?.checks?.health?.responseTime || 0,
      average24h: 1250,
      p95_24h: 2800
    };
    
    // Get active alerts
    const activeAlerts = currentStatus?.alerts || [];
    
    // Get recent incidents (mock data for demo)
    const recentIncidents = [
      {
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'Database connection timeout',
        duration: 180, // seconds
        resolved: true
      }
    ];
    
    // System metrics (mock data - in production would come from analytics)
    const systemMetrics = {
      totalRequests24h: 45230,
      errorRate24h: 0.12,
      slowQueries: 23,
      failedDeployments: 0
    };
    
    const dashboard: MonitoringDashboard = {
      currentStatus: currentStatus?.status || 'healthy',
      uptime: uptimeMetrics,
      responseTime: responseTimeMetrics,
      activeAlerts,
      recentIncidents,
      systemMetrics
    };
    
    return NextResponse.json(dashboard, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data', message: error.message },
      { status: 500 }
    );
  }
}