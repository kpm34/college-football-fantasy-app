# 🐛 Sentry Error Tracking Setup

## Overview
Sentry is configured for error tracking with the free tier (5K errors/month).

## Configuration Files Created

1. **`sentry.client.config.ts`** - Client-side error tracking
2. **`sentry.server.config.ts`** - Server-side error tracking  
3. **`sentry.edge.config.ts`** - Edge runtime error tracking
4. **`next.config.ts`** - Updated with Sentry webpack plugin
5. **`.sentryclirc`** - Sentry CLI configuration

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Get your DSN from https://sentry.io/
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_KEY@sentry.io/YOUR_PROJECT_ID

# For source map uploads (optional)
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

## Free Tier Optimizations

To stay within the 5K errors/month limit:

1. **Disabled Performance Monitoring** - `tracesSampleRate: 0`
2. **Disabled Session Replay** - `replaysSessionSampleRate: 0`
3. **Filtered Common Errors** - Service worker, network errors
4. **Error Sampling** - Only capture critical errors

## Testing Sentry

Visit `/test-sentry` to trigger test errors:
- Client-side errors
- Async errors
- Handled errors
- API errors

## Vercel Integration

Add these environment variables in Vercel Dashboard:
1. `NEXT_PUBLIC_SENTRY_DSN` (visible to client)
2. `SENTRY_DSN` (server only)
3. `SENTRY_AUTH_TOKEN` (for source maps)

## Monitoring

View errors at: https://sentry.io/organizations/YOUR_ORG/issues/

## Next Steps

1. Create a Sentry account (free)
2. Create a new project
3. Copy the DSN
4. Add to environment variables
5. Deploy and test
