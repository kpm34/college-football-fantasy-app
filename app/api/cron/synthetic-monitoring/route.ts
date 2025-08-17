/**
 * Synthetic Monitoring Cron Job
 * 
 * Runs comprehensive health checks and smoke tests
 * Sends alerts if system health degrades
 */

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

interface MonitoringResult {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    health: {
      status: boolean;
      responseTime: number;
      error?: string;
    };
    database: {
      status: boolean;
      responseTime: number;
      error?: string;
    };
    criticalPages: {
      status: boolean;
      successfulChecks: number;
      totalChecks: number;
      failures: string[];
    };
  };
  alerts: string[];
}

// Critical pages to monitor
const CRITICAL_PAGES = [
  { path: '/', name: 'Homepage' },
  { path: '/league', name: 'League Management' },
  { path: '/draft', name: 'Draft System' },
  { path: '/api/players', name: 'Players API' },
  { path: '/api/games', name: 'Games API' }
];

async function checkEndpoint(url: string, timeout: number = 10000): Promise<{ status: boolean; responseTime: number; error?: string }> {
  const start = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Synthetic-Monitor/1.0' }
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - start;
    
    if (!response.ok) {
      return {
        status: false,
        responseTime,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
    
    return { status: true, responseTime };
  } catch (error: any) {
    return {
      status: false,
      responseTime: Date.now() - start,
      error: error.name === 'AbortError' ? 'Timeout' : error.message
    };
  }
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'https://cfbfantasy.app';
  
  const result: MonitoringResult = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      health: { status: false, responseTime: 0 },
      database: { status: false, responseTime: 0 },
      criticalPages: { status: true, successfulChecks: 0, totalChecks: 0, failures: [] }
    },
    alerts: []
  };
  
  // Check health endpoint
  const healthCheck = await checkEndpoint(`${baseUrl}/api/health`, 15000);
  result.checks.health = healthCheck;
  
  if (!healthCheck.status) {
    result.status = 'unhealthy';
    result.alerts.push('Health endpoint is down');
  } else if (healthCheck.responseTime > 5000) {
    result.status = 'degraded';
    result.alerts.push('Health endpoint responding slowly');
  }
  
  // Parse health response for database status
  if (healthCheck.status) {
    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthResponse.json();
      
      result.checks.database = {
        status: healthData.services?.appwrite?.status || false,
        responseTime: healthCheck.responseTime,
        error: healthData.services?.appwrite?.error
      };
      
      if (!result.checks.database.status) {
        result.status = 'unhealthy';
        result.alerts.push('Database connection failed');
      }
    } catch (error: any) {
      result.checks.database = {
        status: false,
        responseTime: healthCheck.responseTime,
        error: error.message
      };
    }
  }
  
  // Check critical pages
  const pageChecks = await Promise.all(
    CRITICAL_PAGES.map(async (page) => {
      const check = await checkEndpoint(`${baseUrl}${page.path}`, 8000);
      return {
        ...page,
        ...check
      };
    })
  );
  
  result.checks.criticalPages.totalChecks = pageChecks.length;
  result.checks.criticalPages.successfulChecks = pageChecks.filter(c => c.status).length;
  result.checks.criticalPages.failures = pageChecks
    .filter(c => !c.status)
    .map(c => `${c.name}: ${c.error || 'Unknown error'}`);
  
  if (result.checks.criticalPages.failures.length > 0) {
    result.status = result.checks.criticalPages.failures.length > 2 ? 'unhealthy' : 'degraded';
    result.alerts.push(`${result.checks.criticalPages.failures.length} critical pages failing`);
  }
  
  // Store monitoring results in KV for alerting
  try {
    await kv.set(`monitoring:${Date.now()}`, result, { ex: 86400 }); // 24 hour retention
    
    // Store latest result
    await kv.set('monitoring:latest', result);
    
    // Check for consecutive failures
    const lastResults = await Promise.all([
      kv.get('monitoring:latest-1'),
      kv.get('monitoring:latest-2'),
      kv.get('monitoring:latest-3')
    ]);
    
    const consecutiveFailures = lastResults.filter(r => 
      r && typeof r === 'object' && 'status' in r && r.status === 'unhealthy'
    ).length;
    
    if (result.status === 'unhealthy' && consecutiveFailures >= 2) {
      result.alerts.push('CRITICAL: System unhealthy for 3+ consecutive checks');
    }
    
    // Rotate latest results
    await kv.set('monitoring:latest-3', await kv.get('monitoring:latest-2'));
    await kv.set('monitoring:latest-2', await kv.get('monitoring:latest-1'));
    await kv.set('monitoring:latest-1', result);
    
  } catch (error: any) {
    // KV storage failure shouldn't break monitoring
    result.alerts.push(`Monitoring storage failed: ${error.message}`);
  }
  
  // Send alerts if critical issues detected
  if (result.alerts.length > 0 && result.status === 'unhealthy') {
    // In production, this would integrate with Slack, Discord, email, etc.
    console.error('SYNTHETIC MONITORING ALERT:', {
      status: result.status,
      alerts: result.alerts,
      timestamp: result.timestamp
    });
  }
  
  return NextResponse.json(result, {
    status: result.status === 'healthy' ? 200 : 503,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Monitoring-Status': result.status
    }
  });
}