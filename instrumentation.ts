export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side instrumentation
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0, // Set to 0 to save on free tier quota
      debug: false,
      environment: process.env.NODE_ENV,
      
      beforeSend(event, hint) {
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
    });
  }
  
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime instrumentation
    const { init } = await import('@sentry/nextjs');
    
    init({
      dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0,
      debug: false,
      environment: process.env.NODE_ENV,
    });
  }
}

