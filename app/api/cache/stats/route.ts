import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Note: In production, you might want to protect this endpoint
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get all keys (be careful with this in production with many keys)
    const keys = await kv.keys('*');
    
    // For demo purposes, we'll simulate hit/miss stats
    // In production, you'd track these metrics properly
    const hits = Math.floor(Math.random() * 1000) + 500;
    const misses = Math.floor(Math.random() * 200) + 50;
    
    // Get sample of key sizes (don't do this for all keys in production)
    const sampleKeys = keys.slice(0, 10);
    let totalSize = 0;
    
    for (const key of sampleKeys) {
      try {
        const value = await kv.get(key);
        if (value) {
          totalSize += JSON.stringify(value).length;
        }
      } catch (error) {
        console.error(`Error getting size for key ${key}:`, error);
      }
    }
    
    // Estimate total size
    const estimatedTotalSize = keys.length > 0 
      ? (totalSize / sampleKeys.length) * keys.length 
      : 0;

    return NextResponse.json({
      hits,
      misses,
      keys: keys.slice(0, 100), // Limit to first 100 keys for UI
      totalKeys: keys.length,
      size: formatBytes(estimatedTotalSize),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    
    // Return empty stats if KV is not configured
    return NextResponse.json({
      hits: 0,
      misses: 0,
      keys: [],
      totalKeys: 0,
      size: '0 B',
      timestamp: new Date().toISOString(),
      error: 'Cache not configured or accessible',
    });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
