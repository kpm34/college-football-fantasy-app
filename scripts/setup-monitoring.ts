/**
 * Monitoring Setup Script
 * 
 * Sets up monitoring infrastructure and validates configuration
 */

import { kv } from '@vercel/kv';

interface MonitoringConfig {
  healthCheckInterval: number;
  syntheticMonitoringInterval: number;
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    consecutiveFailures: number;
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: string | null;
  };
}

async function setupMonitoring() {
  console.log('🏗️  Setting up monitoring infrastructure...');
  
  const config: MonitoringConfig = {
    healthCheckInterval: 300, // 5 minutes
    syntheticMonitoringInterval: 600, // 10 minutes
    alertThresholds: {
      responseTime: 5000, // 5 seconds
      errorRate: 5, // 5%
      consecutiveFailures: 3
    },
    notifications: {
      email: true,
      slack: false,
      webhook: process.env.MONITORING_WEBHOOK_URL || null
    }
  };
  
  try {
    // Store monitoring configuration
    await kv.set('monitoring:config', config);
    console.log('✅ Monitoring configuration stored');
    
    // Initialize monitoring metrics
    await kv.set('monitoring:metrics:uptime', 100);
    await kv.set('monitoring:metrics:last-incident', null);
    await kv.set('monitoring:alerts:active', []);
    console.log('✅ Monitoring metrics initialized');
    
    // Test health endpoint
    const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Health endpoint is responding');
    } else {
      console.log('⚠️  Health endpoint returned status:', healthResponse.status);
    }
    
    // Validate Vercel Cron configuration
    console.log('📋 Vercel Cron Configuration:');
    console.log('   - Health checks: Every 5 minutes (/api/health)');
    console.log('   - Synthetic monitoring: Every 10 minutes (/api/cron/synthetic-monitoring)');
    
    // Validate KV storage
    const testKey = `monitoring:test:${Date.now()}`;
    await kv.set(testKey, { test: true }, { ex: 60 });
    const testValue = await kv.get(testKey);
    
    if (testValue) {
      console.log('✅ KV storage is working');
      await kv.del(testKey);
    } else {
      console.log('❌ KV storage test failed');
    }
    
    console.log('🎉 Monitoring setup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Deploy to Vercel to activate cron jobs');
    console.log('2. Configure webhook notifications (optional)');
    console.log('3. Run smoke tests: npm run test:smoke');
    console.log('4. Check monitoring dashboard: /api/monitoring/dashboard');
    
  } catch (error) {
    console.error('❌ Monitoring setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupMonitoring();
}

export default setupMonitoring;