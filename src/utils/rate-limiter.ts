export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Set default rate limits for known APIs
    this.configs.set('espn', { windowMs: 60000, maxRequests: 60 }); // 60 per minute
    this.configs.set('cfbd', { windowMs: 60000, maxRequests: 120 }); // 120 per minute (free tier)
    this.configs.set('default', { windowMs: 60000, maxRequests: 60 }); // Default fallback
  }

  async waitIfNeeded(apiName: string): Promise<void> {
    const config = this.configs.get(apiName) || this.configs.get('default')!;
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get or initialize request timestamps for this API
    const apiRequests = this.requests.get(apiName) || [];
    
    // Filter out requests outside the current window
    const recentRequests = apiRequests.filter(timestamp => timestamp > windowStart);
    
    // If we're at the limit, calculate wait time
    if (recentRequests.length >= config.maxRequests) {
      const oldestRequest = recentRequests[0];
      const waitTime = (oldestRequest + config.windowMs) - now;
      
      if (waitTime > 0) {
        console.log(`Rate limit reached for ${apiName}. Waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Recursive call to recheck after waiting
        return this.waitIfNeeded(apiName);
      }
    }
    
    // Add current request timestamp
    recentRequests.push(now);
    this.requests.set(apiName, recentRequests);
  }

  canMakeRequest(apiName: string): boolean {
    const config = this.configs.get(apiName) || this.configs.get('default')!;
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const apiRequests = this.requests.get(apiName) || [];
    const recentRequests = apiRequests.filter(timestamp => timestamp > windowStart);
    
    return recentRequests.length < config.maxRequests;
  }

  recordRequest(apiName: string): void {
    const now = Date.now();
    const apiRequests = this.requests.get(apiName) || [];
    apiRequests.push(now);
    this.requests.set(apiName, apiRequests);
  }

  getRemainingRequests(apiName: string): number {
    const config = this.configs.get(apiName) || this.configs.get('default')!;
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    const apiRequests = this.requests.get(apiName) || [];
    const recentRequests = apiRequests.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  getResetTime(apiName: string): number {
    const config = this.configs.get(apiName) || this.configs.get('default')!;
    const apiRequests = this.requests.get(apiName) || [];
    
    if (apiRequests.length === 0) return 0;
    
    const oldestRequest = apiRequests[0];
    return oldestRequest + config.windowMs;
  }

  updateConfig(apiName: string, config: RateLimitConfig): void {
    this.configs.set(apiName, config);
  }

  clearHistory(apiName?: string): void {
    if (apiName) {
      this.requests.delete(apiName);
    } else {
      this.requests.clear();
    }
  }
}