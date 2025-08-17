import { NextRequest, NextResponse } from 'next/server';
import { startDraft } from '@/lib/draft/engine';
import { serverDatabases as databases, DATABASE_ID } from '@/lib/appwrite-server';

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
    
    if (mode === 'human') {
      // For human drafts, just mark as active but don't auto-execute
      await databases.updateDocument(
        DATABASE_ID,
        'mock_drafts',
        draftId,
        {
          status: 'active',
          startedAt: new Date().toISOString()
        }
      );
      
      console.log('✅ Human draft marked as active, waiting for picks...');
      
      return NextResponse.json({
        ok: true,
        message: 'Human draft started, awaiting picks'
      });
      
    } else {
      // Bot mode - run the entire draft to completion
      await startDraft(draftId);
      
      return NextResponse.json({
        ok: true,
        message: 'Bot draft completed successfully'
      });
    }
    
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