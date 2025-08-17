import { NextResponse } from 'next/server';
import { client, databases, DATABASE_ID } from '@/lib/appwrite-generated';

export async function GET() {
  // Return current configuration for debugging
  const config = {
    endpoint: process.env.APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1",
    projectId: process.env.APPWRITE_PROJECT_ID || "college-football-fantasy-app",
    databaseId: process.env.APPWRITE_DATABASE_ID,
    environment: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    timestamp: new Date().toISOString(),
  };

  // Test Appwrite connectivity
  let appwriteStatus = 'unknown';
  try {
    const response = await fetch(`${config.endpoint}/health/version`, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': config.projectId,
      },
    });
    appwriteStatus = response.ok ? 'connected' : `error: ${response.status}`;
  } catch (error) {
    appwriteStatus = `error: ${error instanceof Error ? error.message : 'unknown'}`;
  }

  return NextResponse.json({
    config,
    appwriteStatus,
    recommendations: [
      'Ensure these domains are added to Appwrite web platform:',
      '- https://cfbfantasy.app',
      '- https://www.cfbfantasy.app',
      '- https://collegefootballfantasy.app',
      '- https://www.collegefootballfantasy.app',
      '',
      'OAuth redirect URLs should include:',
      '- https://cfbfantasy.app/',
      '- https://cfbfantasy.app/login',
      '- https://www.cfbfantasy.app/',
      '- https://www.cfbfantasy.app/login',
      '- https://collegefootballfantasy.app/',
      '- https://collegefootballfantasy.app/login',
      '- https://www.collegefootballfantasy.app/',
      '- https://www.collegefootballfantasy.app/login',
    ],
  });
}

