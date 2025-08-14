import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    // Intentionally throw an error to test Sentry
    throw new Error('Test API error from College Football Fantasy!');
  } catch (error) {
    // Capture the error in Sentry
    Sentry.captureException(error, {
      tags: {
        section: 'api',
        endpoint: 'test-sentry-error'
      },
      level: 'error'
    });
    
    return NextResponse.json(
      { error: 'Test error triggered and sent to Sentry' },
      { status: 500 }
    );
  }
}
