export interface CacheEntry<T> {
  data: T;
  expires: number;
  etag?: string;
}

export class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number = 1000; // Maximum number of entries
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(maxSize: number = 1000, autoCleanup: boolean = true) {
    this.maxSize = maxSize;
    
    if (autoCleanup) {
      // Run cleanup every 5 minutes
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300, etag?: string): void {
    // If cache is full, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entriesToRemove = Math.floor(this.maxSize * 0.1); // Remove 10%
      const sortedEntries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].expires - b[1].expires);
      
      for (let i = 0; i < entriesToRemove; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000),
      etag
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  getWithEtag<T>(key: string): { data: T; etag?: string } | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: entry.data as T,
      etag: entry.etag
    };
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (entry.expires < now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  getStats(): {
    size: number;
    maxSize: number;
    utilization: number;
    expiredCount?: number;
  } {
    const now = Date.now();
    let expiredCount = 0;

    this.cache.forEach(entry => {
      if (entry.expires < now) {
        expiredCount++;
      }
    });

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize) * 100,
      expiredCount
    };
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Specialized cache for different data types
export class DataCache {
  private gamesCache: SimpleCache;
  private teamsCache: SimpleCache;
  private playersCache: SimpleCache;
  private rankingsCache: SimpleCache;

  constructor() {
    // Different TTLs for different data types
    this.gamesCache = new SimpleCache(500); // Games change frequently
    this.teamsCache = new SimpleCache(100); // Teams are relatively static
    this.playersCache = new SimpleCache(1000); // Large but static during season
    this.rankingsCache = new SimpleCache(10); // Small, changes weekly
  }

  // Games cache - 5 minute TTL during games, 1 hour otherwise
  cacheGames(key: string, data: any, isLive: boolean = false): void {
    const ttl = isLive ? 300 : 3600; // 5 min or 1 hour
    this.gamesCache.set(key, data, ttl);
  }

  getGames(key: string): any {
    return this.gamesCache.get(key);
  }

  // Teams cache - 24 hour TTL
  cacheTeams(key: string, data: any): void {
    this.teamsCache.set(key, data, 86400);
  }

  getTeams(key: string): any {
    return this.teamsCache.get(key);
  }

  // Players cache - 12 hour TTL
  cachePlayers(key: string, data: any): void {
    this.playersCache.set(key, data, 43200);
  }

  getPlayers(key: string): any {
    return this.playersCache.get(key);
  }

  // Rankings cache - 1 hour TTL (updated weekly but cached for performance)
  cacheRankings(key: string, data: any): void {
    this.rankingsCache.set(key, data, 3600);
  }

  getRankings(key: string): any {
    return this.rankingsCache.get(key);
  }

  // Clear all caches
  clearAll(): void {
    this.gamesCache.clear();
    this.teamsCache.clear();
    this.playersCache.clear();
    this.rankingsCache.clear();
  }

  // Get cache statistics
  getStats(): Record<string, any> {
    return {
      games: this.gamesCache.getStats(),
      teams: this.teamsCache.getStats(),
      players: this.playersCache.getStats(),
      rankings: this.rankingsCache.getStats()
    };
  }

  // Destroy all caches
  destroy(): void {
    this.gamesCache.destroy();
    this.teamsCache.destroy();
    this.playersCache.destroy();
    this.rankingsCache.destroy();
  }
}