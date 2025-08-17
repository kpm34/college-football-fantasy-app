// Middleware configuration for API routes
// Defines which routes need authentication and special handling

export const API_CONFIG = {
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
  ],

  // Rate limiting configuration
  rateLimits: {
    '/api/auth/login': { requests: 5, window: 300 }, // 5 requests per 5 minutes
    '/api/auth/signup': { requests: 3, window: 600 }, // 3 requests per 10 minutes
    '/api/draft': { requests: 60, window: 60 }, // 60 requests per minute
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
  },
};

// Helper to check if route is public
export function isPublicRoute(pathname: string): boolean {
  return API_CONFIG.publicRoutes.some(route => pathname.startsWith(route));
}

// Helper to check if route requires admin
export function isAdminRoute(pathname: string): boolean {
  return API_CONFIG.adminRoutes.some(route => pathname.startsWith(route));
}

// Helper to get rate limit for route
export function getRateLimit(pathname: string): { requests: number; window: number } {
  for (const [route, limit] of Object.entries(API_CONFIG.rateLimits)) {
    if (pathname.startsWith(route)) {
      return limit as { requests: number; window: number };
    }
  }
  return API_CONFIG.rateLimits.default;
}
