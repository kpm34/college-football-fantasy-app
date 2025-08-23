import { NextRequest, NextResponse } from 'next/server';
import { dataSyncManager } from '@lib/data-sync';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    console.log('🏈 Starting scheduled data sync...');
    
    // Get current date for season/week determination
    const now = new Date();
    const month = now.getMonth() + 1; // 0-indexed
    const season = now.getFullYear();
    
    // Determine what to sync based on time
    const sources = ['cfbd']; // Always sync CFBD
    
    // Add Rotowire during season (August-December)
    if (month >= 8 || month <= 1) {
      sources.push('rotowire');
    }
    
    // Sync all sources
    const results = await dataSyncManager.syncAll({
      sources,
      season,
      forceUpdate: false
    });
    
    // Check for failures
    const failures = results.filter(r => !r.success);
    if (failures.length > 0) {
      console.error('Some syncs failed:', failures);
      
      // You could send alerts here
      // await sendAlert('Data sync failures', failures);
    }
    
    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Cron sync error:', error);
    
    // You could send critical alerts here
    // await sendCriticalAlert('Data sync cron failed', error);
    
    return NextResponse.json(
      { error: 'Cron sync failed', message: error.message },
      { status: 500 }
    );
  }
}

// Configure for Vercel Cron
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
