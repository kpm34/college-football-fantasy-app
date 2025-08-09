import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getFlag } from '@/lib/feature-flags'

// Rate limiting map (in-memory for edge runtime)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only apply middleware to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  try {
    // Check maintenance mode
    const maintenanceMode = await getFlag('maintenanceMode')
    if (maintenanceMode) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable for maintenance' },
        { status: 503 }
      )
    }
    
    // Check if AI chat endpoint is enabled
    if (pathname === '/api/ai' || pathname.startsWith('/api/chat')) {
      const chatEnabled = await getFlag('chatEnabled')
      if (chatEnabled === false) {
        return NextResponse.json(
          { error: 'AI chat service is currently disabled' },
          { status: 503 }
        )
      }
    }
    
    // Rate limiting with Edge Config multiplier
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitMultiplier = await getFlag('apiRateLimitMultiplier')
    const baseLimit = 60 // requests per minute
    const limit = Math.floor(baseLimit * rateLimitMultiplier)
    
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    
    // Get or create rate limit entry
    let rateLimit = rateLimitMap.get(clientIp)
    if (!rateLimit || now > rateLimit.resetTime) {
      rateLimit = { count: 0, resetTime: now + windowMs }
      rateLimitMap.set(clientIp, rateLimit)
    }
    
    // Check rate limit
    if (rateLimit.count >= limit) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      )
    }
    
    // Increment counter
    rateLimit.count++
    
    // Add rate limit headers to response
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', limit.toString())
    response.headers.set('X-RateLimit-Remaining', (limit - rateLimit.count).toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())
    
    // Add feature flag headers for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      response.headers.set('X-Edge-Config-Maintenance', maintenanceMode ? 'true' : 'false')
      response.headers.set('X-Edge-Config-RateLimit-Multiplier', rateLimitMultiplier.toString())
    }
    
    return response
  } catch (error) {
    // If Edge Config fails, allow requests through but log the error
    console.error('Edge Config error in middleware:', error)
    return NextResponse.next()
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/:path*',
    // Exclude static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}