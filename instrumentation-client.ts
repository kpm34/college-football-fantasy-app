import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0, // Only track errors, not transactions
  debug: false,
  replaysOnErrorSampleRate: 0, // Disable replay to save quota
  replaysSessionSampleRate: 0,
  environment: process.env.NODE_ENV,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  beforeSend(event, hint) {
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
  
  ignoreErrors: [
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'fb_xd_fragment',
    'Non-Error promise rejection captured',
    'Non-Error exception captured',
  ],
});

