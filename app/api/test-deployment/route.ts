import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'API routes are working',
    timestamp: new Date().toISOString(),
    env: {
      hasAppwriteKey: !!process.env.APPWRITE_API_KEY,
      hasCollectionPlayers: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PLAYERS
    }
  });
}

