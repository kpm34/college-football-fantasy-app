import { NextResponse, NextRequest } from 'next/server';

// Basic rate limiter (IP + path) using in-memory Map (sufficient for single-region dev; replace with KV in prod)
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120; // requests per minute
const buckets = new Map<string, { count: number; resetAt: number }>();

const CANONICAL_HOST = 'cfbfantasy.app';
const WWW_ALTERNATES = new Set([
  'www.cfbfantasy.app',
  'collegefootballfantasy.app',
  'www.collegefootballfantasy.app',
]);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto') || 'https';

  // Force HTTPS on Vercel and normalize host to canonical domain
  if (host && host !== CANONICAL_HOST && WWW_ALTERNATES.has(host)) {
    const url = new URL(request.nextUrl);
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  // Ensure HTTPS (except for localhost)
  const isLocalhost = host?.includes('localhost') || host?.includes('127.0.0.1');
  if (proto !== 'https' && !isLocalhost) {
    const url = new URL(request.nextUrl);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Optional CSP (disable if it breaks OAuth, adjust as needed)
  const enableCsp = process.env.NEXT_PUBLIC_ENABLE_CSP === 'true';
  if (enableCsp) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://nyc.cloud.appwrite.io https://api.collegefootballdata.com https://*.vercel.app",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }

  // Rate limit sensitive API routes
  const pathname = request.nextUrl.pathname;
  const isSensitive = pathname.startsWith('/api/auth') || pathname.startsWith('/api/leagues') || pathname.startsWith('/api/draft');
  if (isSensitive) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${pathname}`;
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
    }
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > RATE_LIMIT_MAX) {
      return new NextResponse('Too Many Requests', { status: 429, headers: {
        'Retry-After': Math.ceil((bucket.resetAt - now) / 1000).toString(),
      }});
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|documentation/.*).*)'],
};



