import { kv } from '@vercel/kv'

type LimitResult = { allowed: boolean; remaining: number; reset: number }

/**
 * Sliding window rate limit: limit requests per windowMs per identifier.
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<LimitResult> {
  const now = Date.now()
  const windowStart = now - windowMs

  // Clean up old entries
  await kv.zremrangebyscore(identifier, 0, windowStart)

  // Current count
  const count = await kv.zcard(identifier)

  if (count >= limit) {
    // Get oldest timestamp in window to calculate reset
    const oldest = (await kv.zrange(identifier, 0, 0)) as unknown as string[]
    const oldestValue = Array.isArray(oldest) && typeof oldest[0] === 'string' ? oldest[0] : `${now}`
    const reset = parseInt(oldestValue, 10) + windowMs
    return { allowed: false, remaining: 0, reset }
  }

  // Add current request timestamp
  await kv.zadd(identifier, { score: now, member: `${now}` })
  // Set TTL slightly > window to auto-expire keys
  await kv.expire(identifier, Math.ceil(windowMs / 1000) + 60)

  return { allowed: true, remaining: limit - count - 1, reset: now + windowMs }
}