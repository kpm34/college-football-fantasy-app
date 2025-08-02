# College Football Fantasy App - Appwrite Migration Rollout Plan

## Overview
Complete migration plan for replacing Supabase with Appwrite across all 10 system components.

## Component Migration Matrix

| #  | Component                         | Supabase → Appwrite Changes                               | Priority | Week |
|----|-----------------------------------|-----------------------------------------------------------|----------|------|
| 1  | Database Schema                   | PostgreSQL → Appwrite Collections                         | Critical | 1    |
| 2  | Nightly ETL                       | Supabase client → Appwrite SDK                           | High     | 2    |
| 3  | AP Top-25 Cache                   | Keep Redis, update data sync                              | Medium   | 3    |
| 4  | ESPN Live Scraper                 | Supabase Realtime → Appwrite Realtime                    | Critical | 2    |
| 5  | Eligibility REST API              | Supabase queries → Appwrite Database API                 | High     | 2    |
| 6  | Draft Lobby (Snake)               | Supabase Realtime → Appwrite Realtime                    | Critical | 3    |
| 7  | Auction Draft                     | Supabase subscriptions → Appwrite subscriptions          | High     | 3    |
| 8  | Fantasy Scoring Engine            | Update data access layer                                  | Medium   | 2    |
| 9  | GitHub Actions CI                 | Update env vars and SDK                                  | Low      | 4    |
| 10 | Service Worker PWA                | Update offline sync logic                                 | Medium   | 4    |

## Phase 1: Database Migration (Week 1)

### 1. Appwrite Database Schema

```javascript
// Collections Structure
const collections = {
  // Users Collection
  users: {
    id: 'unique()',
    email: 'string',
    username: 'string',
    avatar_url: 'string',
    created_at: 'datetime',
    indexes: ['email', 'username']
  },

  // Teams Collection
  teams: {
    id: 'unique()',
    user_id: 'string',
    league_id: 'string',
    name: 'string',
    budget: 'double',
    total_score: 'double',
    week_scores: 'object', // JSON array
    created_at: 'datetime',
    indexes: ['user_id', 'league_id']
  },

  // Players Collection
  players: {
    id: 'unique()',
    cfbd_id: 'string',
    name: 'string',
    team: 'string',
    position: 'string',
    jersey_number: 'integer',
    height: 'integer',
    weight: 'integer',
    year: 'string',
    home_state: 'string',
    stats: 'object', // JSON object
    fantasy_points: 'double',
    salary: 'double',
    indexes: ['cfbd_id', 'team', 'position']
  },

  // Leagues Collection
  leagues: {
    id: 'unique()',
    name: 'string',
    commissioner_id: 'string',
    type: 'string', // 'snake' or 'auction'
    max_teams: 'integer',
    scoring_settings: 'object',
    draft_date: 'datetime',
    status: 'string',
    indexes: ['commissioner_id', 'status']
  },

  // Rosters Collection
  rosters: {
    id: 'unique()',
    team_id: 'string',
    player_id: 'string',
    week: 'integer',
    position: 'string',
    is_starter: 'boolean',
    acquired_date: 'datetime',
    indexes: ['team_id', 'player_id', 'week']
  },

  // Transactions Collection
  transactions: {
    id: 'unique()',
    team_id: 'string',
    player_id: 'string',
    type: 'string', // 'add', 'drop', 'trade'
    amount: 'double',
    week: 'integer',
    timestamp: 'datetime',
    indexes: ['team_id', 'week', 'timestamp']
  },

  // Games Collection
  games: {
    id: 'unique()',
    cfbd_game_id: 'string',
    week: 'integer',
    home_team: 'string',
    away_team: 'string',
    home_score: 'integer',
    away_score: 'integer',
    status: 'string',
    start_time: 'datetime',
    indexes: ['week', 'status', 'start_time']
  },

  // Player Stats Collection
  player_stats: {
    id: 'unique()',
    player_id: 'string',
    game_id: 'string',
    week: 'integer',
    passing_yards: 'integer',
    passing_tds: 'integer',
    rushing_yards: 'integer',
    rushing_tds: 'integer',
    receiving_yards: 'integer',
    receiving_tds: 'integer',
    fantasy_points: 'double',
    indexes: ['player_id', 'game_id', 'week']
  },

  // Draft Picks Collection
  draft_picks: {
    id: 'unique()',
    league_id: 'string',
    team_id: 'string',
    player_id: 'string',
    pick_number: 'integer',
    round: 'integer',
    amount: 'double', // for auction
    timestamp: 'datetime',
    indexes: ['league_id', 'pick_number']
  }
};
```

### Migration Script
```python
# migrate_supabase_to_appwrite.py
import os
from appwrite.client import Client
from appwrite.services.databases import Databases
from supabase import create_client
import json

# Initialize clients
supabase = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

appwrite = Client()
appwrite.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
appwrite.set_project(os.getenv('APPWRITE_PROJECT_ID'))
appwrite.set_key(os.getenv('APPWRITE_API_KEY'))

databases = Databases(appwrite)
DATABASE_ID = os.getenv('APPWRITE_DATABASE_ID')

# Migration functions for each table
async def migrate_users():
    users = supabase.table('users').select('*').execute()
    for user in users.data:
        await databases.create_document(
            DATABASE_ID,
            'users',
            'unique()',
            user
        )

# Similar functions for other collections...
```

## Phase 2: Component Updates (Week 2)

### 2. Nightly ETL (CollegeFootballData)
```python
# etl/cfbd_to_appwrite.py
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
import cfbd
import asyncio

class CFBDToAppwrite:
    def __init__(self):
        self.client = Client()
        self.client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        self.client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        self.client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        self.db = Databases(self.client)
        self.cfbd_api = cfbd.ApiClient(
            configuration=cfbd.Configuration(
                api_key={'Authorization': os.getenv('CFBD_API_KEY')}
            )
        )
    
    async def sync_players(self, year=2024):
        players_api = cfbd.PlayersApi(self.cfbd_api)
        players = players_api.get_players(year=year)
        
        for player in players:
            await self.db.create_document(
                DATABASE_ID,
                'players',
                'unique()',
                {
                    'cfbd_id': str(player.id),
                    'name': player.name,
                    'team': player.team,
                    'position': player.position,
                    'jersey_number': player.jersey,
                    'height': player.height,
                    'weight': player.weight,
                    'year': player.year,
                    'home_state': player.home_state
                }
            )
```

### 4. ESPN Live Scraper Worker
```python
# workers/espn_live_scraper.py
import asyncio
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.services.realtime import Realtime
from bs4 import BeautifulSoup
import aiohttp

class ESPNLiveScraper:
    def __init__(self):
        self.client = Client()
        self.client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        self.client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        self.client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        self.db = Databases(self.client)
        self.realtime = Realtime(self.client)
        
    async def start_polling(self):
        while True:
            games = await self.fetch_live_games()
            for game in games:
                await self.update_game_stats(game)
            await asyncio.sleep(15)
    
    async def update_game_stats(self, game_data):
        # Update game in Appwrite
        await self.db.update_document(
            DATABASE_ID,
            'games',
            game_data['id'],
            game_data
        )
        
        # Publish to realtime channel
        channel = f"games.{game_data['id']}"
        # Appwrite Realtime will automatically notify subscribers
```

### 5. Eligibility REST API
```python
# api/eligibility.py
from fastapi import FastAPI, HTTPException
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

app = FastAPI()

client = Client()
client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
client.set_key(os.getenv('APPWRITE_API_KEY'))

db = Databases(client)

@app.get("/eligibility/{player_id}/{week}")
async def check_eligibility(player_id: str, week: int):
    try:
        # Check if player is already rostered
        roster_check = await db.list_documents(
            DATABASE_ID,
            'rosters',
            queries=[
                Query.equal('player_id', player_id),
                Query.equal('week', week)
            ]
        )
        
        if roster_check['total'] > 0:
            return {"eligible": False, "reason": "Already rostered"}
        
        # Check player status
        player = await db.get_document(
            DATABASE_ID,
            'players',
            player_id
        )
        
        return {
            "eligible": True,
            "player": player,
            "week": week
        }
        
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
```

### 6. Draft Lobby (Snake Draft)
```typescript
// components/DraftLobby.tsx
import { Client, Databases, Realtime } from 'appwrite';
import { useEffect, useState } from 'react';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

const databases = new Databases(client);
const realtime = new Realtime(client);

export function DraftLobby({ leagueId }: { leagueId: string }) {
  const [picks, setPicks] = useState([]);
  const [currentPick, setCurrentPick] = useState(null);
  
  useEffect(() => {
    // Subscribe to draft picks collection
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.draft_picks.documents`,
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          setPicks(prev => [...prev, response.payload]);
        }
      }
    );
    
    return () => unsubscribe();
  }, [leagueId]);
  
  const makePick = async (playerId: string) => {
    await databases.createDocument(
      DATABASE_ID,
      'draft_picks',
      'unique()',
      {
        league_id: leagueId,
        team_id: currentTeamId,
        player_id: playerId,
        pick_number: currentPickNumber,
        round: currentRound,
        timestamp: new Date().toISOString()
      }
    );
  };
  
  return (
    // Draft UI components
  );
}
```

### 7. Auction Draft Add-on
```typescript
// components/AuctionDraft.tsx
import { Client, Databases, Realtime } from 'appwrite';

export function AuctionDraft({ leagueId }: { leagueId: string }) {
  const [bids, setBids] = useState([]);
  const [currentAuction, setCurrentAuction] = useState(null);
  
  useEffect(() => {
    // Subscribe to auction bids
    const unsubscribe = client.subscribe(
      [`databases.${DATABASE_ID}.collections.auction_bids.documents`],
      (response) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          handleNewBid(response.payload);
        }
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  const placeBid = async (playerId: string, amount: number) => {
    await databases.createDocument(
      DATABASE_ID,
      'auction_bids',
      'unique()',
      {
        league_id: leagueId,
        team_id: currentTeamId,
        player_id: playerId,
        amount: amount,
        timestamp: new Date().toISOString()
      }
    );
  };
}
```

### 8. Fantasy Scoring Engine
```python
# scoring/fantasy_engine.py
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query

class FantasyScoringEngine:
    def __init__(self):
        self.client = Client()
        self.client.set_endpoint(os.getenv('APPWRITE_ENDPOINT'))
        self.client.set_project(os.getenv('APPWRITE_PROJECT_ID'))
        self.client.set_key(os.getenv('APPWRITE_API_KEY'))
        
        self.db = Databases(self.client)
        
        self.scoring_rules = {
            'passing_yards': 0.04,
            'passing_tds': 4,
            'interceptions': -2,
            'rushing_yards': 0.1,
            'rushing_tds': 6,
            'receiving_yards': 0.1,
            'receiving_tds': 6,
            'fumbles_lost': -2
        }
    
    async def calculate_player_score(self, player_id: str, week: int):
        stats = await self.db.list_documents(
            DATABASE_ID,
            'player_stats',
            queries=[
                Query.equal('player_id', player_id),
                Query.equal('week', week)
            ]
        )
        
        if stats['total'] == 0:
            return 0
        
        stat = stats['documents'][0]
        score = 0
        
        for stat_type, multiplier in self.scoring_rules.items():
            if stat_type in stat:
                score += stat[stat_type] * multiplier
        
        # Update player's fantasy points
        await self.db.update_document(
            DATABASE_ID,
            'player_stats',
            stat['$id'],
            {'fantasy_points': score}
        )
        
        return score
```

## Phase 3: Infrastructure Updates (Week 3)

### Environment Configuration
```bash
# .env.production
# Remove Supabase
# SUPABASE_URL=
# SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_KEY=

# Add Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_DATABASE_ID=your-database-id

# Keep existing
REDIS_URL=your-upstash-redis-url
CFBD_API_KEY=your-cfbd-api-key
```

### Docker Compose for Self-Hosted Appwrite
```yaml
# docker-compose.yml
version: '3'

services:
  appwrite:
    image: appwrite/appwrite:latest
    container_name: appwrite
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    networks:
      - appwrite
    volumes:
      - appwrite-uploads:/storage/uploads:rw
      - appwrite-cache:/storage/cache:rw
      - appwrite-config:/storage/config:rw
      - appwrite-certificates:/storage/certificates:rw
      - appwrite-functions:/storage/functions:rw
    environment:
      - _APP_ENV=production
      - _APP_LOCALE=en
      - _APP_CONSOLE_WHITELIST_ROOT=enabled
      - _APP_CONSOLE_WHITELIST_EMAILS=
      - _APP_CONSOLE_WHITELIST_IPS=
      - _APP_SYSTEM_EMAIL_NAME=College Football Fantasy
      - _APP_SYSTEM_EMAIL_ADDRESS=system@yourapp.com
      - _APP_SYSTEM_SECURITY_EMAIL_ADDRESS=security@yourapp.com
      - _APP_USAGE_STATS=enabled
      - _APP_LOGGING_PROVIDER=
      - _APP_LOGGING_CONFIG=
      - _APP_USAGE_AGGREGATION_INTERVAL=30
      - _APP_WORKER_PER_CORE=6
      - _APP_REDIS_HOST=redis
      - _APP_REDIS_PORT=6379
      - _APP_DB_HOST=mariadb
      - _APP_DB_PORT=3306
      - _APP_DB_SCHEMA=appwrite
      - _APP_DB_USER=appwrite
      - _APP_DB_PASS=appwrite
      - _APP_INFLUXDB_HOST=influxdb
      - _APP_INFLUXDB_PORT=8086
      - _APP_STATSD_HOST=telegraf
      - _APP_STATSD_PORT=8125

  mariadb:
    image: mariadb:10.7
    container_name: appwrite-mariadb
    restart: unless-stopped
    networks:
      - appwrite
    volumes:
      - appwrite-mariadb:/var/lib/mysql:rw
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=appwrite
      - MYSQL_USER=appwrite
      - MYSQL_PASSWORD=appwrite

  redis:
    image: redis:6.2-alpine
    container_name: appwrite-redis
    restart: unless-stopped
    networks:
      - appwrite
    volumes:
      - appwrite-redis:/data:rw

  influxdb:
    image: influxdb:1.8
    container_name: appwrite-influxdb
    restart: unless-stopped
    networks:
      - appwrite
    volumes:
      - appwrite-influxdb:/var/lib/influxdb:rw

  telegraf:
    image: telegraf:1.18
    container_name: appwrite-telegraf
    restart: unless-stopped
    networks:
      - appwrite

networks:
  appwrite:

volumes:
  appwrite-mariadb:
  appwrite-redis:
  appwrite-influxdb:
  appwrite-uploads:
  appwrite-cache:
  appwrite-config:
  appwrite-certificates:
  appwrite-functions:
```

## Phase 4: Testing & Deployment (Week 4)

### Testing Strategy
```javascript
// tests/appwrite-integration.test.js
import { Client, Databases, Account } from 'appwrite';

describe('Appwrite Integration Tests', () => {
  let client;
  let databases;
  let account;
  
  beforeAll(() => {
    client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID);
    
    databases = new Databases(client);
    account = new Account(client);
  });
  
  test('Create and retrieve user', async () => {
    const user = await account.create(
      'unique()',
      'test@example.com',
      'password123'
    );
    
    expect(user.email).toBe('test@example.com');
  });
  
  test('Create and query team', async () => {
    const team = await databases.createDocument(
      DATABASE_ID,
      'teams',
      'unique()',
      {
        name: 'Test Team',
        user_id: 'test-user',
        league_id: 'test-league',
        budget: 100000
      }
    );
    
    expect(team.name).toBe('Test Team');
  });
});
```

### GitHub Actions Update
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  APPWRITE_ENDPOINT: ${{ secrets.APPWRITE_ENDPOINT }}
  APPWRITE_PROJECT_ID: ${{ secrets.APPWRITE_PROJECT_ID }}
  APPWRITE_API_KEY: ${{ secrets.APPWRITE_API_KEY }}
  APPWRITE_DATABASE_ID: ${{ secrets.APPWRITE_DATABASE_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run Appwrite integration tests
        run: npm run test:integration

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action@v28
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
      
      - name: Deploy Workers to Fly.io
        uses: superfly/flyctl-actions@v1
        with:
          args: "deploy"
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Service Worker Update
```javascript
// public/service-worker.js
import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);

self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-roster') {
    event.waitUntil(syncRosterData());
  }
});

async function syncRosterData() {
  const cache = await caches.open('roster-cache-v1');
  const cachedRequests = await cache.keys();
  
  for (const request of cachedRequests) {
    const response = await cache.match(request);
    const data = await response.json();
    
    if (data.type === 'roster-update') {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          'rosters',
          data.id,
          data.updates
        );
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync:', error);
      }
    }
  }
}
```

## Rollout Schedule

### Week 1: Foundation
- [ ] Set up Appwrite instance
- [ ] Create all collections and indexes
- [ ] Write and test migration scripts
- [ ] Backup all Supabase data

### Week 2: Core Services
- [ ] Migrate ETL pipeline
- [ ] Update ESPN scraper
- [ ] Convert REST APIs
- [ ] Update scoring engine

### Week 3: Frontend & Realtime
- [ ] Convert draft lobby components
- [ ] Migrate auction draft system
- [ ] Update all React components
- [ ] Test realtime subscriptions

### Week 4: Testing & Deployment
- [ ] Run full integration tests
- [ ] Performance benchmarking
- [ ] Update CI/CD pipelines
- [ ] Deploy to staging

### Week 5: Production Rollout
- [ ] Final data migration
- [ ] Switch DNS/routing
- [ ] Monitor performance
- [ ] Keep Supabase as backup

## Monitoring & Rollback Plan

### Health Checks
```javascript
// monitoring/health-check.js
async function checkAppwriteHealth() {
  try {
    const health = await fetch(`${APPWRITE_ENDPOINT}/health`);
    const db = await databases.listDocuments(DATABASE_ID, 'players', [
      Query.limit(1)
    ]);
    
    return {
      api: health.ok,
      database: db.total >= 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      api: false,
      database: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
```

### Rollback Procedure
1. Keep Supabase running for 30 days
2. Maintain bidirectional sync during transition
3. One-command rollback script ready
4. DNS switch can revert in < 5 minutes

## Success Metrics
- Zero data loss
- < 10ms latency increase
- 99.9% uptime during migration
- All features functional
- Positive user feedback

## Post-Migration Benefits
1. **Self-hosting option** for data sovereignty
2. **Better pricing** for scale
3. **More flexible permissions** system
4. **Built-in functions** platform
5. **Native file storage** with transformations
6. **Better offline support** via SDKs
7. **GraphQL API** option
8. **More authentication providers**