# Sentry Configuration Update for Next.js 15

## 📝 Overview
Updated Sentry configuration to use Next.js 15's new instrumentation pattern, eliminating all build warnings.

## 🔄 Changes Made

### ✅ Created New Files
1. **`instrumentation.ts`** - Server and Edge runtime instrumentation
2. **`instrumentation-client.ts`** - Client-side instrumentation
3. **`app/global-error.tsx`** - Global error boundary for React errors

### ❌ Removed Old Files
1. `sentry.client.config.ts` - Replaced by instrumentation-client.ts
2. `sentry.server.config.ts` - Replaced by instrumentation.ts
3. `sentry.edge.config.ts` - Replaced by instrumentation.ts

### 🔧 Updated Configuration
- Added `experimental.instrumentationHook: true` to `next.config.ts`
- Added `experimental.clientTraceMetadata` for proper trace propagation

## 🎯 Benefits
1. **No Build Warnings** - Eliminates all Sentry-related warnings during build
2. **Next.js 15 Compliance** - Uses the recommended instrumentation pattern
3. **Better Error Handling** - Global error boundary catches React rendering errors
4. **Cleaner Architecture** - Consolidated configuration in standard locations

## 🚀 How It Works

### Server-Side Instrumentation
The `instrumentation.ts` file exports a `register()` function that runs when:
- `NEXT_RUNTIME === 'nodejs'` - Node.js server runtime
- `NEXT_RUNTIME === 'edge'` - Edge runtime (Vercel Edge Functions)

### Client-Side Instrumentation
The `instrumentation-client.ts` file automatically initializes Sentry in the browser.

### Global Error Boundary
The `app/global-error.tsx` component:
- Catches unhandled React errors
- Reports them to Sentry automatically
- Shows a user-friendly error page
- Provides recovery options (retry/home)

## 📊 Current Settings
- **Traces Sample Rate**: 0% (saving quota, only tracking errors)
- **Replay Sample Rate**: 0% (disabled to save quota)
- **Environment**: Automatically set based on NODE_ENV
- **Filtered Errors**: 
  - Service Worker registration errors
  - Network fetch failures
  - Aborted requests
  - Expected Appwrite 404s
  - Rate limit errors

## 🔍 Monitoring
Errors are sent to Sentry with:
- Full stack traces
- User context (when available)
- Environment information
- Custom tags and metadata

## 📚 References
- [Next.js 15 Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)
- [Sentry Next.js Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Global Error Handling](https://nextjs.org/docs/app/building-your-application/error-handling)

