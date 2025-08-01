export interface DataFeedConfig {
  name: string;
  type: 'primary' | 'backup' | 'supplemental';
  baseUrl: string;
  authentication: AuthConfig;
  endpoints: Record<string, EndpointConfig>;
  rateLimits: RateLimitConfig;
  priority: number;
}

export interface AuthConfig {
  type: 'api_key' | 'bearer' | 'basic' | 'none';
  headerName?: string;
  credentials?: {
    key?: string;
    secret?: string;
    token?: string;
  };
}

export interface EndpointConfig {
  path: string;
  method: 'GET' | 'POST';
  refreshInterval: number; // seconds
  timeout: number; // milliseconds
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffSeconds: number;
  };
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
  burstLimit: number;
}

export const DATA_FEEDS: Record<string, DataFeedConfig> = {
  COLLEGE_FOOTBALL_DATA: {
    name: 'CollegeFootballData API v2',
    type: 'primary',
    baseUrl: 'https://api.collegefootballdata.com',
    authentication: {
      type: 'bearer',
      headerName: 'Authorization',
      credentials: {
        token: process.env.CFBD_API_KEY
      }
    },
    endpoints: {
      teams: {
        path: '/teams',
        method: 'GET',
        refreshInterval: 86400, // daily
        timeout: 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      },
      roster: {
        path: '/roster',
        method: 'GET',
        refreshInterval: 86400, // daily
        timeout: 15000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      },
      games: {
        path: '/games',
        method: 'GET',
        refreshInterval: 3600, // hourly
        timeout: 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      },
      plays: {
        path: '/plays',
        method: 'GET',
        refreshInterval: 30, // 30 seconds during games
        timeout: 5000,
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 1.5,
          maxBackoffSeconds: 10
        }
      },
      stats: {
        path: '/stats/player/season',
        method: 'GET',
        refreshInterval: 300, // 5 minutes
        timeout: 20000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      }
    },
    rateLimits: {
      requestsPerSecond: 30,
      requestsPerMinute: 500,
      requestsPerHour: 10000,
      burstLimit: 50
    },
    priority: 1
  },
  
  SPORTRADAR: {
    name: 'Sportradar NCAAFB API',
    type: 'primary',
    baseUrl: 'https://api.sportradar.com/ncaafb/production/v7/en',
    authentication: {
      type: 'api_key',
      headerName: 'api_key',
      credentials: {
        key: process.env.SPORTRADAR_API_KEY
      }
    },
    endpoints: {
      schedule: {
        path: '/games/{year}/{month}/{day}/schedule.json',
        method: 'GET',
        refreshInterval: 3600,
        timeout: 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      },
      gameBoxscore: {
        path: '/games/{game_id}/boxscore.json',
        method: 'GET',
        refreshInterval: 10, // 10 seconds during live games
        timeout: 5000,
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 1.5,
          maxBackoffSeconds: 10
        }
      },
      teamRoster: {
        path: '/teams/{team_id}/roster.json',
        method: 'GET',
        refreshInterval: 86400,
        timeout: 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      },
      playerProfile: {
        path: '/players/{player_id}/profile.json',
        method: 'GET',
        refreshInterval: 86400,
        timeout: 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      },
      injuries: {
        path: '/league/injuries.json',
        method: 'GET',
        refreshInterval: 3600,
        timeout: 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      }
    },
    rateLimits: {
      requestsPerSecond: 10,
      requestsPerMinute: 120,
      requestsPerHour: 5000,
      burstLimit: 20
    },
    priority: 2
  },
  
  ESPN_FALLBACK: {
    name: 'ESPN Hidden JSON Endpoints',
    type: 'backup',
    baseUrl: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football',
    authentication: {
      type: 'none'
    },
    endpoints: {
      scoreboard: {
        path: '/scoreboard',
        method: 'GET',
        refreshInterval: 60,
        timeout: 8000,
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 2,
          maxBackoffSeconds: 20
        }
      },
      teams: {
        path: '/teams/{teamId}',
        method: 'GET',
        refreshInterval: 86400,
        timeout: 10000,
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffSeconds: 30
        }
      },
      summary: {
        path: '/summary',
        method: 'GET',
        refreshInterval: 30,
        timeout: 5000,
        retryPolicy: {
          maxRetries: 2,
          backoffMultiplier: 1.5,
          maxBackoffSeconds: 10
        }
      }
    },
    rateLimits: {
      requestsPerSecond: 5,
      requestsPerMinute: 100,
      requestsPerHour: 2000,
      burstLimit: 10
    },
    priority: 3
  }
};

export class FeedPriorityManager {
  private feedHealth: Map<string, FeedHealth> = new Map();
  
  constructor() {
    Object.keys(DATA_FEEDS).forEach(feedName => {
      this.feedHealth.set(feedName, {
        isHealthy: true,
        lastSuccessTime: Date.now(),
        consecutiveFailures: 0,
        averageResponseTime: 0
      });
    });
  }
  
  getActiveFeed(feedType: 'teams' | 'games' | 'stats' | 'injuries'): DataFeedConfig | null {
    const feeds = Object.entries(DATA_FEEDS)
      .filter(([_, config]) => config.endpoints[feedType])
      .sort((a, b) => {
        const healthA = this.feedHealth.get(a[0]);
        const healthB = this.feedHealth.get(b[0]);
        
        if (healthA?.isHealthy && !healthB?.isHealthy) return -1;
        if (!healthA?.isHealthy && healthB?.isHealthy) return 1;
        
        return a[1].priority - b[1].priority;
      });
    
    return feeds.length > 0 ? feeds[0][1] : null;
  }
  
  recordSuccess(feedName: string, responseTime: number): void {
    const health = this.feedHealth.get(feedName);
    if (health) {
      health.isHealthy = true;
      health.lastSuccessTime = Date.now();
      health.consecutiveFailures = 0;
      health.averageResponseTime = 
        (health.averageResponseTime * 0.9) + (responseTime * 0.1);
    }
  }
  
  recordFailure(feedName: string): void {
    const health = this.feedHealth.get(feedName);
    if (health) {
      health.consecutiveFailures++;
      if (health.consecutiveFailures >= 3) {
        health.isHealthy = false;
      }
    }
  }
}

interface FeedHealth {
  isHealthy: boolean;
  lastSuccessTime: number;
  consecutiveFailures: number;
  averageResponseTime: number;
}