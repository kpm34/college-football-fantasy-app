/**
 * Unified Sentry Configuration
 * Handles both client and server-side error tracking
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// Common configuration shared between client and server
const commonConfig = {
  dsn: SENTRY_DSN,
  tracesSampleRate: 0, // Set to 0 to save on free tier quota
  debug: false,
  environment: process.env.NODE_ENV,
  replaysOnErrorSampleRate: 0, // Disable replay to save quota
  replaysSessionSampleRate: 0,
};

// Common error filters
const commonIgnoreErrors = [
  'top.GLOBALS',
  'originalCreateNotification',
  'canvas.contentDocument',
  'MyApp_RemoveAllHighlights',
  'fb_xd_fragment',
  'Non-Error promise rejection captured',
  'Non-Error exception captured',
];

// Server-side configuration
export const serverConfig = {
  ...commonConfig,
  
  beforeSend(event: any, hint: any) {
    if (event.exception) {
      const error = hint.originalException;
      
      // Skip expected Appwrite errors
      if (error?.message?.includes('AppwriteException') && error?.code === 404) {
        return null;
      }
      
      // Skip rate limit errors
      if (error?.message?.includes('Too Many Requests')) {
        return null;
      }
    }
    
    return event;
  },
  
  ignoreTransactions: [
    '/api/health',
    '/api/status',
    '/_next/static',
    '/_next/image',
    '/favicon.ico',
  ],
};

// Client-side configuration
export const clientConfig = {
  ...commonConfig,
  
  integrations: [
    // Disable replay integration to avoid edge runtime issues
    // Sentry.replayIntegration({
    //   maskAllText: false,
    //   blockAllMedia: false,
    // }),
  ],
  
  beforeSend(event: any, hint: any) {
    if (event.exception) {
      const error = hint.originalException;
      
      // Skip service worker registration errors
      if (error?.message?.includes('Service Worker')) {
        return null;
      }
      
      // Skip network errors expected in offline mode
      if (error?.message?.includes('Failed to fetch')) {
        return null;
      }
      
      // Skip canceled requests
      if (error?.name === 'AbortError') {
        return null;
      }
    }
    
    return event;
  },
  
  ignoreErrors: commonIgnoreErrors,
};

// Initialize Sentry based on runtime
export async function initSentry() {
  if (typeof window === 'undefined') {
    // Server-side
    if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
      Sentry.init(serverConfig);
    }
  } else {
    // Client-side
    Sentry.init(clientConfig);
  }
}

// Export for Next.js instrumentation hook
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { init } = await import('@sentry/nextjs');
    init(serverConfig);
  }
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    const { init } = await import('@sentry/nextjs');
    init(serverConfig);
  }
}
