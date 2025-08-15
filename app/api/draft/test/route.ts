import { NextResponse } from 'next/server';
import { serverDatabases as databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET() {
  try {
    // Simple test query
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PLAYERS || 'college_players',
      [
        Query.equal('draftable', true),
        Query.limit(5)
      ]
    );

    return NextResponse.json({
      success: true,
      database: DATABASE_ID,
      collection: COLLECTIONS.PLAYERS || 'college_players',
      total: response.total,
      documents: response.documents.length,
      firstPlayer: response.documents[0]?.name || 'None',
      collections: COLLECTIONS
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      database: DATABASE_ID,
      collection: COLLECTIONS.PLAYERS || 'college_players',
      collections: COLLECTIONS
    }, { status: 500 });
  }
}
