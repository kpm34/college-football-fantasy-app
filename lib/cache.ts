import { kv } from '@vercel/kv';

// Cache key prefixes
const CACHE_PREFIXES = {
  PLAYER: 'player:',
  PLAYERS_LIST: 'players:list:',
  LEAGUE: 'league:',
  RANKINGS: 'rankings:',
  GAMES: 'games:',
  USER: 'user:',
  DRAFT: 'draft:',
  API: 'api:',
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60,           // 1 minute - for rapidly changing data
  MEDIUM: 300,         // 5 minutes - for moderately changing data
  LONG: 3600,          // 1 hour - for slowly changing data
  VERY_LONG: 86400,    // 24 hours - for rarely changing data
  WEEK: 604800,        // 1 week - for static data
} as const;

/**
 * Generic cache wrapper for any async function
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  duration: number = CACHE_DURATIONS.MEDIUM
): Promise<T> {
  try {
    // Try to get from cache first
    const cached = await kv.get<T>(key);
    if (cached !== null) {
      console.log(`[Cache HIT] ${key}`);
      return cached;
    }
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    // Continue to fetch fresh data
  }

  console.log(`[Cache MISS] ${key}`);
  
  try {
    // Fetch fresh data
    const fresh = await fetcher();
    
    // Store in cache (fire and forget)
    kv.setex(key, duration, fresh).catch(err => 
      console.error('[Cache] Error writing to cache:', err)
    );
    
    return fresh;
  } catch (error) {
    // If fetcher fails, try stale cache as fallback
    try {
      const stale = await kv.get<T>(key);
      if (stale !== null) {
        console.log(`[Cache] Using stale data for ${key}`);
        return stale;
      }
    } catch {}
    
    throw error;
  }
}

/**
 * Invalidate cache by key or pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    if (pattern.includes('*')) {
      // Pattern-based deletion
      const keys = await kv.keys(pattern);
      if (keys.length > 0) {
        await kv.del(...keys);
        console.log(`[Cache] Invalidated ${keys.length} keys matching ${pattern}`);
      }
    } else {
      // Single key deletion
      await kv.del(pattern);
      console.log(`[Cache] Invalidated ${pattern}`);
    }
  } catch (error) {
    console.error('[Cache] Error invalidating cache:', error);
  }
}

/**
 * Cache helpers for specific data types
 */
export const cache = {
  // Player data
  player: {
    get: (playerId: string) => 
      withCache(
        `${CACHE_PREFIXES.PLAYER}${playerId}`,
        async () => {
          // Fetcher will be provided by caller
          throw new Error('Fetcher required');
        },
        CACHE_DURATIONS.LONG
      ),
    
    list: (filters: Record<string, any> = {}) => {
      const key = `${CACHE_PREFIXES.PLAYERS_LIST}${JSON.stringify(filters)}`;
      return {
        key,
        get: (fetcher: () => Promise<any>) => 
          withCache(key, fetcher, CACHE_DURATIONS.MEDIUM)
      };
    },
    
    invalidate: (playerId?: string) => 
      invalidateCache(playerId ? `${CACHE_PREFIXES.PLAYER}${playerId}` : `${CACHE_PREFIXES.PLAYER}*`)
  },

  // League data
  league: {
    get: (leagueId: string, fetcher: () => Promise<any>) =>
      withCache(
        `${CACHE_PREFIXES.LEAGUE}${leagueId}`,
        fetcher,
        CACHE_DURATIONS.SHORT // Leagues change frequently during draft
      ),
    
    invalidate: (leagueId: string) =>
      invalidateCache(`${CACHE_PREFIXES.LEAGUE}${leagueId}`)
  },

  // Rankings data
  rankings: {
    get: (week: number, fetcher: () => Promise<any>) =>
      withCache(
        `${CACHE_PREFIXES.RANKINGS}week:${week}`,
        fetcher,
        CACHE_DURATIONS.VERY_LONG // Rankings update weekly
      ),
    
    invalidate: () =>
      invalidateCache(`${CACHE_PREFIXES.RANKINGS}*`)
  },

  // Games data
  games: {
    get: (week: number, fetcher: () => Promise<any>) =>
      withCache(
        `${CACHE_PREFIXES.GAMES}week:${week}`,
        fetcher,
        CACHE_DURATIONS.LONG
      ),
    
    invalidate: (week?: number) =>
      invalidateCache(week ? `${CACHE_PREFIXES.GAMES}week:${week}` : `${CACHE_PREFIXES.GAMES}*`)
  },

  // API responses (generic)
  api: {
    get: (endpoint: string, params: Record<string, any> = {}) => {
      const key = `${CACHE_PREFIXES.API}${endpoint}:${JSON.stringify(params)}`;
      return {
        key,
        get: (fetcher: () => Promise<any>, duration = CACHE_DURATIONS.MEDIUM) =>
          withCache(key, fetcher, duration)
      };
    }
  }
};

/**
 * Batch operations for performance
 */
export async function batchGet<T extends Record<string, any>>(
  keys: string[]
): Promise<Partial<T>> {
  try {
    const values = await kv.mget(...keys);
    const result: Partial<T> = {};
    
    keys.forEach((key, index) => {
      if (values[index] !== null) {
        result[key as keyof T] = values[index] as T[keyof T];
      }
    });
    
    return result;
  } catch (error) {
    console.error('[Cache] Batch get error:', error);
    return {};
  }
}

export async function batchSet(
  items: Array<{ key: string; value: any; ttl?: number }>
): Promise<void> {
  try {
    // KV doesn't have native batch set, so we use Promise.all
    await Promise.all(
      items.map(({ key, value, ttl }) =>
        ttl ? kv.setex(key, ttl, value) : kv.set(key, value)
      )
    );
  } catch (error) {
    console.error('[Cache] Batch set error:', error);
  }
}

/**
 * Cache warming utilities
 */
export async function warmCache(
  patterns: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>
): Promise<void> {
  console.log('[Cache] Warming cache...');
  
  const results = await Promise.allSettled(
    patterns.map(async ({ key, fetcher, ttl }) => {
      const data = await fetcher();
      await kv.setex(key, ttl || CACHE_DURATIONS.MEDIUM, data);
      return key;
    })
  );
  
  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  console.log(`[Cache] Warmed ${succeeded}/${patterns.length} keys`);
}
