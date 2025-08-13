import { NextResponse, NextRequest } from 'next/server';

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

  // Ensure HTTPS
  if (proto !== 'https') {
    const url = new URL(request.nextUrl);
    url.protocol = 'https:';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|service-worker.js).*)',
  ],
};



