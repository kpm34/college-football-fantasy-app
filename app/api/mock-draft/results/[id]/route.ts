// app/api/mock-draft/results/[id]/route.ts
import { NextResponse } from 'next/server';
import { getDraftResults } from '@/lib/draft/engine';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const draftId = params.id;
    
    console.log(`📊 Getting results for draft: ${draftId}`);
    
    // Get draft results
    const results = await getDraftResults(draftId);
    
    return NextResponse.json(results);
    
  } catch (error) {
    console.error('Mock draft results error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a "not found" error
    if (errorMessage.includes('not found') || errorMessage.includes('Document not found')) {
      return NextResponse.json(
        { 
          error: 'Draft not found',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get draft results',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
