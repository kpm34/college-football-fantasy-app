# Data Sources Integration - Free APIs Only

## Free Data Sources Strategy

### 1. ESPN Public API (Primary - No Auth Required)
```
Base URL: https://site.api.espn.com/apis/site/v2/sports/football/college-football
```

**Key Endpoints:**
- `/scoreboard` - Live scores and game info
- `/scoreboard?dates=20240901&groups=80` - Specific date & conference (80=SEC, 1=ACC, 4=Big 12, 5=Big Ten)
- `/teams` - All teams with conference info
- `/teams/{teamId}/roster` - Team rosters
- `/summary?event={gameId}` - Detailed game stats

### 2. CollegeFootballData API (Free Tier)
```
Base URL: https://api.collegefootballdata.com
Free Tier: 120 requests/minute
```

**Quick Setup:**
1. Sign up at https://collegefootballdata.com
2. Get free API key
3. Add header: `Authorization: Bearer YOUR_API_KEY`

**Essential Endpoints:**
- `/rankings` - AP Top 25 polls
- `/games?year=2024&seasonType=regular` - Season schedules
- `/stats/player/season?year=2024` - Player statistics

### 3. The Sports DB (Free)
```
Base URL: https://www.thesportsdb.com/api/v1/json/3
No Auth Required
```

**Useful Endpoints:**
- `/searchteams.php?t={teamName}` - Team info
- `/eventslast.php?id={teamId}` - Recent games
- `/eventsnext.php?id={teamId}` - Upcoming games

### 4. Reddit CFB API (Unofficial)
```
Base URL: https://api.reddit.com/r/CFB
Rate Limit: 60 requests/minute
```

**Game Threads & Updates:**
- `/search.json?q=game+thread&restrict_sr=1&sort=new`

### 5. Data Scraping Fallbacks

**ESPN Scraping Endpoints (No Rate Limits):**
```javascript
// Team pages
https://www.espn.com/college-football/team/_/id/{teamId}

// Player pages  
https://www.espn.com/college-football/player/_/id/{playerId}

// Standings
https://www.espn.com/college-football/standings
```

## Implementation Plan

### Step 1: Create Data Service
```typescript
// data-service.ts
class FreeDataService {
  private espnBase = 'https://site.api.espn.com/apis/site/v2/sports/football/college-football';
  private cfbdBase = 'https://api.collegefootballdata.com';
  private cfbdKey = process.env.CFBD_API_KEY || '';
  
  // Conference IDs for ESPN
  private conferences = {
    'SEC': 8,
    'Big 12': 4,
    'Big Ten': 5,
    'ACC': 1
  };

  async getCurrentWeekGames() {
    try {
      // Try ESPN first (no auth needed)
      const response = await fetch(`${this.espnBase}/scoreboard`);
      return await response.json();
    } catch (error) {
      console.error('ESPN failed, trying CFBD...');
      // Fallback to CFBD
      const response = await fetch(`${this.cfbdBase}/games?year=2024&week=1`, {
        headers: { 'Authorization': `Bearer ${this.cfbdKey}` }
      });
      return await response.json();
    }
  }

  async getAPRankings() {
    // CFBD is the only free source for AP rankings
    const response = await fetch(`${this.cfbdBase}/rankings?year=2024&seasonType=regular`, {
      headers: { 'Authorization': `Bearer ${this.cfbdKey}` }
    });
    return await response.json();
  }

  async getTeamRoster(teamId: string) {
    // ESPN provides rosters without auth
    const response = await fetch(`${this.espnBase}/teams/${teamId}/roster`);
    return await response.json();
  }

  async getLiveGameStats(gameId: string) {
    // ESPN game summary - updates every 30 seconds
    const response = await fetch(`${this.espnBase}/summary?event=${gameId}`);
    return await response.json();
  }
}
```

### Step 2: Create Rate Limiter
```typescript
// rate-limiter.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  canMakeRequest(api: string, limit: number = 60): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    const apiRequests = this.requests.get(api) || [];
    const recentRequests = apiRequests.filter(time => time > windowStart);
    
    if (recentRequests.length < limit) {
      recentRequests.push(now);
      this.requests.set(api, recentRequests);
      return true;
    }
    return false;
  }
}
```

### Step 3: Create Eligibility Checker
```typescript
// eligibility-checker.ts
class EligibilityChecker {
  private apRankings: Map<string, number> = new Map();
  
  async updateAPRankings(rankings: any[]) {
    rankings.forEach(team => {
      this.apRankings.set(team.school, team.rank);
    });
  }

  isPlayerEligible(
    playerTeam: string,
    playerConference: string,
    opponentTeam: string,
    opponentConference: string
  ): boolean {
    // Check if opponent is AP Top 25
    if (this.apRankings.has(opponentTeam)) {
      return true;
    }
    
    // Check if it's a conference game
    if (playerConference === opponentConference && 
        ['SEC', 'ACC', 'Big 12', 'Big Ten'].includes(playerConference)) {
      return true;
    }
    
    return false;
  }
}
```

### Step 4: Create Caching Layer
```typescript
// cache.ts
class SimpleCache {
  private cache: Map<string, { data: any, expires: number }> = new Map();
  
  set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }
}
```

### Step 5: WebSocket Alternative (Server-Sent Events)
```typescript
// live-updates.ts
class LiveUpdates {
  private updateInterval: NodeJS.Timer | null = null;
  
  startPolling(gameIds: string[], callback: (data: any) => void) {
    this.updateInterval = setInterval(async () => {
      for (const gameId of gameIds) {
        const data = await this.fetchGameUpdate(gameId);
        callback(data);
      }
    }, 30000); // Poll every 30 seconds
  }
  
  async fetchGameUpdate(gameId: string) {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=${gameId}`
    );
    return await response.json();
  }
}
```

## Quick Start Implementation

1. **Get CFBD API Key** (2 minutes):
   - Go to https://collegefootballdata.com
   - Sign up with email
   - Copy API key

2. **Create `.env` file**:
```
CFBD_API_KEY=your_key_here
```

3. **Install Dependencies**:
```bash
npm init -y
npm install node-fetch dotenv typescript @types/node
```

4. **Test Data Fetching**:
```typescript
// test-fetch.ts
import fetch from 'node-fetch';

async function testAPIs() {
  // Test ESPN (no auth)
  const espnGames = await fetch(
    'https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard'
  ).then(r => r.json());
  console.log('ESPN Games:', espnGames.events?.length);
  
  // Test CFBD (with key)
  const rankings = await fetch(
    'https://api.collegefootballdata.com/rankings',
    { headers: { 'Authorization': `Bearer ${process.env.CFBD_API_KEY}` }}
  ).then(r => r.json());
  console.log('AP Rankings:', rankings[0]?.polls[0]?.ranks?.length);
}
```

This setup uses only free APIs and can be fully functional today!