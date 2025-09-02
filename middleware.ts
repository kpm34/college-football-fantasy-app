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
  const pathname = request.nextUrl.pathname;

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
  const isDiagramAsset = pathname.startsWith('/diagrams/');
  // Allow iframing our own static diagrams, otherwise deny
  response.headers.set('X-Frame-Options', isDiagramAsset ? 'SAMEORIGIN' : 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Content Security Policy to block third‑party injections while allowing Appwrite & Google OAuth
  // Enabled in non-development environments by default; can be forced via NEXT_PUBLIC_ENABLE_CSP
  const enableCsp = process.env.NEXT_PUBLIC_ENABLE_CSP === 'true' || process.env.NODE_ENV !== 'development';
  if (enableCsp) {
    const csp = [
      "default-src 'self'",
      // Allow Next.js live reload in preview, Appwrite SDK via jsDelivr, and Google OAuth domains
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel.live https://accounts.google.com https://apis.google.com https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.gstatic.com",
      "connect-src 'self' https://nyc.cloud.appwrite.io wss://nyc.cloud.appwrite.io https://api.collegefootballdata.com https://*.vercel.app wss://*.vercel.app https://accounts.google.com https://apis.google.com",
      "font-src 'self' data:",
      // Allow Google OAuth redirect flows and diagrams.net viewer in frames
      "frame-src 'self' https://accounts.google.com https://viewer.diagrams.net",
      isDiagramAsset ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
      // Report CSP violations to our endpoint (best-effort)
      `report-uri ${request.nextUrl.origin}/api/security/csp-report`
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }

  // Rate limit sensitive API routes
  
  const isSensitive = pathname.startsWith('/api/auth') || pathname.startsWith('/api/leagues') || pathname.startsWith('/api/draft');
  if (isSensitive) {
    const fwd = request.headers.get('x-forwarded-for');
    const ip = (fwd ? fwd.split(',')[0].trim() : null)
      || request.headers.get('x-real-ip')
      || request.headers.get('cf-connecting-ip')
      || request.headers.get('x-client-ip')
      || 'unknown';
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js|documentation/.*|docs/.*).*)'],
};



