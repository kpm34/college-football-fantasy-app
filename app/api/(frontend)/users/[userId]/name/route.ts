import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { clientId } = params;

    // Get user details from Appwrite Users API using server key
    const userRes = await fetch(`https://nyc.cloud.appwrite.io/v1/users/${clientId}`, {
      headers: {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Key': process.env.APPWRITE_API_KEY!,
        'X-Appwrite-Response-Format': '1.4.0',
      },
    });

    if (!userRes.ok) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await userRes.json();
    
    return NextResponse.json({
      name: user.name || user.email || 'Unknown User',
      email: user.email
    });

  } catch (error) {
    console.error('User name fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}