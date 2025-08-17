import { NextRequest, NextResponse } from 'next/server';
import { getDraftResults } from '@/lib/draft/engine';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('draftId');
    
    // Input validation
    if (!draftId) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`📊 Getting results for draft: ${draftId}`);
    
    // Get draft results
    const results = await getDraftResults(draftId);
    
    return NextResponse.json({
      success: true,
      ...results
    });
    
  } catch (error) {
    console.error('Mock draft results error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a "not found" error
    if (errorMessage.includes('not found') || errorMessage.includes('Document not found')) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Draft not found',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get draft results',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}