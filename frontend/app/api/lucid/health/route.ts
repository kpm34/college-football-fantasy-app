import { NextResponse } from 'next/server';

export async function GET() {
  const hasClientId = !!process.env.LUCID_CLIENT_ID;
  const hasClientSecret = !!process.env.LUCID_CLIENT_SECRET;
  const hasRedirectUri = !!process.env.LUCID_REDIRECT_URI;
  const hasApiKey = !!process.env.LUCID_API_KEY;
  
  const config = {
    clientId: process.env.LUCID_CLIENT_ID ? `${process.env.LUCID_CLIENT_ID.substring(0, 10)}...` : 'not configured',
    redirectUri: process.env.LUCID_REDIRECT_URI || 'not configured',
    embedDomain: process.env.LUCID_EMBED_DOMAIN || 'not configured',
    hasClientSecret,
    hasApiKey,
  };

  const isHealthy = hasClientId && hasClientSecret && hasRedirectUri;

  return NextResponse.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    configured: isHealthy,
    environment: process.env.NODE_ENV,
    config,
    timestamp: new Date().toISOString(),
  });
}