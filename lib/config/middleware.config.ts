/**
 * Unified Middleware Configuration
 * Defines authentication, rate limiting, CORS, and routing rules
 */

export const MIDDLEWARE_CONFIG = {
  // Public routes (no auth required)
  publicRoutes: [
    '/api/health',
    '/api/games',
    '/api/rankings', 
    '/api/players/cached',
    '/api/games/cached',
    '/api/rankings/cached',
    '/api/test-sentry-error',
    '/api/cache/stats',
  ],

  // Routes that require authentication
  protectedRoutes: [
    '/api/leagues',
    '/api/draft',
    '/api/auth/user',
    '/api/auth/update-profile',
    '/api/auth/logout',
    '/api/cache/invalidate',
  ],

  // Routes that require admin/commissioner privileges
  adminRoutes: [
    '/api/leagues/set-commissioner',
    '/api/leagues/migrate',
    '/api/players/cleanup',
    '/api/cron',
    '/api/admin',
  ],

  // Rate limiting configuration
  rateLimits: {
    '/api/auth/login': { requests: 5, window: 300 }, // 5 requests per 5 minutes
    '/api/auth/signup': { requests: 3, window: 600 }, // 3 requests per 10 minutes
    '/api/draft': { requests: 60, window: 60 }, // 60 requests per minute
    '/api/leagues/create': { requests: 10, window: 3600 }, // 10 leagues per hour
    '/api/leagues/join': { requests: 20, window: 3600 }, // 20 join attempts per hour
    default: { requests: 100, window: 60 }, // 100 requests per minute default
  },

  // CORS configuration
  cors: {
    allowedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',
      'https://cfbfantasy.app',
      'https://www.cfbfantasy.app',
      'https://collegefootballfantasy.app',
      'https://www.collegefootballfantasy.app',
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Appwrite-Project'],
    credentials: true,
  },

  // Security headers
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },

  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://vercel.live', 'https://*.vercel-scripts.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", 'https://nyc.cloud.appwrite.io', 'https://*.sentry.io', 'wss://'],
    'frame-src': ["'self'", 'https://vercel.live'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  
  // API versioning
  apiVersion: 'v1',
  
  // Request size limits
  bodySizeLimit: '10mb',
  
  // Timeout settings (in seconds)
  timeouts: {
    default: 30,
    longRunning: 60,
    backgroundJobs: 300,
  },
};

// Helper functions
export function isPublicRoute(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.publicRoutes.some(route => pathname.startsWith(route));
}

export function isProtectedRoute(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.protectedRoutes.some(route => pathname.startsWith(route));
}

export function isAdminRoute(pathname: string): boolean {
  return MIDDLEWARE_CONFIG.adminRoutes.some(route => pathname.startsWith(route));
}

export function getRateLimit(pathname: string): { requests: number; window: number } {
  for (const [route, limit] of Object.entries(MIDDLEWARE_CONFIG.rateLimits)) {
    if (route !== 'default' && pathname.startsWith(route)) {
      return limit as { requests: number; window: number };
    }
  }
  return MIDDLEWARE_CONFIG.rateLimits.default;
}

export function getCSPHeader(): string {
  const directives = Object.entries(MIDDLEWARE_CONFIG.csp)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
  return directives;
}

export function getCORSHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (origin && MIDDLEWARE_CONFIG.cors.allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (MIDDLEWARE_CONFIG.cors.allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  }
  
  headers['Access-Control-Allow-Methods'] = MIDDLEWARE_CONFIG.cors.allowedMethods.join(', ');
  headers['Access-Control-Allow-Headers'] = MIDDLEWARE_CONFIG.cors.allowedHeaders.join(', ');
  
  if (MIDDLEWARE_CONFIG.cors.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return headers;
}
