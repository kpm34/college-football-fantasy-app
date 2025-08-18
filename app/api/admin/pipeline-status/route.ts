import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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
  
  // Check if user is admin
  if (user.email !== 'kashpm2002@gmail.com') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const pipelineStatus = {
      timestamp: new Date().toISOString(),
      status: 'CONSOLIDATED',
      architecture: 'Single Source of Truth',
      ssot: {
        location: '/schema/zod-schema.ts',
        collections: 'Centralized registry',
        validation: 'Runtime + build guards',
        status: 'Active'
      },
      consolidation: {
        schemaFiles: 'Unified into 1 SSOT',
        appwriteConfigs: 'Reduced to 2 canonical files',
        buildGuards: 'Active',
        driftDetection: 'Automated'
      },
      system: {
        version: '3.0 (Consolidated)',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        projectMap: '/PROJECT_MAP.md'
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
}