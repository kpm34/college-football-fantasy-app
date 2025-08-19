import { NextRequest, NextResponse } from 'next/server';
import { startMockDraft } from '@/lib/draft/mock-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, mode = 'bot' } = body; // Add mode parameter (bot|human)
    
    // Input validation
    if (!draftId || typeof draftId !== 'string') {
      return NextResponse.json(
        { error: 'Draft ID is required and must be a string' },
        { status: 400 }
      );
    }
    
    console.log(`🎯 Starting mock draft: ${draftId} (mode: ${mode})`);
    
    // For now, mock drafts are always bot-only and run to completion
    await startMockDraft(draftId);
    
    return NextResponse.json({
      ok: true,
      message: 'Mock draft completed successfully'
    });
    
  } catch (error) {
    console.error('Mock draft start error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        ok: false,
        error: 'Failed to start mock draft',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}